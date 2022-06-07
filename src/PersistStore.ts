import {
  action,
  IReactionDisposer,
  isAction,
  isComputedProp,
  makeObservable,
  observable,
  ObservableMap,
  reaction,
  runInAction,
  toJS,
} from 'mobx';
import { PersistStoreMap } from './PersistStoreMap';
import { PersistenceStorageOptions, ReactionOptions } from './types';
import { StorageAdapter } from './StorageAdapter';
import { mpsConfig, mpsReactionOptions } from './configurePersistable';
import {
  actionPersistWarningIf,
  computedPersistWarningIf,
  consoleDebug,
  invalidStorageAdaptorWarningIf,
  isArrayForMap,
} from './utils';

export class PersistStore<T, P extends keyof T> {
  private cancelWatch: IReactionDisposer | null = null;
  private properties: string[] = [];
  private reactionOptions: ReactionOptions = {};
  private storageAdapter: StorageAdapter | null = null;
  private target: T | null = null;
  private readonly debugMode: boolean = false;

  public isHydrated = false;
  public isPersisting = false;
  public readonly storageName: string = '';

  constructor(target: T, options: PersistenceStorageOptions<P>, reactionOptions: ReactionOptions = {}) {
    this.target = target;
    this.storageName = options.name;
    this.properties = options.properties as string[];
    this.reactionOptions = Object.assign({ fireImmediately: true }, mpsReactionOptions, reactionOptions);
    this.debugMode = options.debugMode ?? mpsConfig.debugMode ?? false;
    this.storageAdapter = new StorageAdapter({
      expireIn: options.expireIn ?? mpsConfig.expireIn,
      removeOnExpiration: options.removeOnExpiration ?? mpsConfig.removeOnExpiration ?? true,
      stringify: options.stringify ?? mpsConfig.stringify ?? true,
      storage: options.storage ? options.storage : mpsConfig.storage,
      debugMode: this.debugMode,
    });

    makeObservable(
      this,
      {
        clearPersistedStore: action,
        hydrateStore: action,
        isHydrated: observable,
        isPersisting: observable,
        pausePersisting: action,
        startPersisting: action,
        stopPersisting: action,
      },
      { autoBind: true, deep: false },
    );

    invalidStorageAdaptorWarningIf(this.storageAdapter.options.storage, this.storageName);

    consoleDebug(this.debugMode, `${this.storageName} - (makePersistable)`, {
      properties: this.properties,
      storageAdapter: this.storageAdapter,
      reactionOptions: this.reactionOptions,
    });
  }

  public async init(): Promise<PersistStore<T, P>> {
    await this.hydrateStore();

    this.startPersisting();

    return this;
  }

  public async hydrateStore(): Promise<void> {
    // If the user calls stopPersist and then rehydrateStore we don't want to automatically call startPersist below
    const isBeingWatched = Boolean(this.cancelWatch);

    if (this.isPersisting) {
      this.pausePersisting();
    }

    runInAction(() => {
      this.isHydrated = false;
      consoleDebug(this.debugMode, `${this.storageName} - (hydrateStore) isHydrated:`, this.isHydrated);
    });

    if (this.storageAdapter && this.target) {
      const data: Record<string, unknown> | undefined = await this.storageAdapter.getItem(this.storageName);

      // Reassigning so TypeScript doesn't complain (Object is possibly 'null') about this.target within forEach
      const target: any = this.target;

      if (data) {
        runInAction(() => {
          this.properties.forEach((propertyName: string) => {
            const allowPropertyHydration = [
              target.hasOwnProperty(propertyName),
              typeof data[propertyName] !== 'undefined',
            ].every(Boolean);

            if (allowPropertyHydration) {
              const propertyData = data[propertyName];

              if (target[propertyName] instanceof ObservableMap && isArrayForMap(propertyData)) {
                target[propertyName] = new Map(propertyData);
              } else {
                target[propertyName] = propertyData;
              }
            }
          });
        });
      }
    }

    runInAction(() => {
      this.isHydrated = true;
      consoleDebug(this.debugMode, `${this.storageName} - isHydrated:`, this.isHydrated);
    });

    if (isBeingWatched) {
      this.startPersisting();
    }
  }

  public startPersisting(): void {
    if (!this.storageAdapter || !this.target || this.cancelWatch) {
      return;
    }

    // Reassigning so TypeScript doesn't complain (Object is possibly 'null') about and this.target within reaction
    const target: any = this.target;

    this.cancelWatch = reaction(
      () => {
        const propertiesToWatch: Record<string, unknown> = {};

        this.properties.forEach((propertyName: string) => {
          const isComputedProperty = isComputedProp(target, String(propertyName));
          const isActionProperty = isAction(target[propertyName]);

          computedPersistWarningIf(isComputedProperty, propertyName);
          actionPersistWarningIf(isActionProperty, propertyName);

          if (!isComputedProperty && !isActionProperty) {
            let propertyData = target[propertyName];

            if (propertyData instanceof ObservableMap) {
              const mapArray: any = [];
              propertyData.forEach((v, k) => {
                mapArray.push([k, toJS(v)]);
              });
              propertyData = mapArray;
            }

            propertiesToWatch[propertyName] = toJS(propertyData);
          }
        });

        return propertiesToWatch;
      },
      async (dataToSave) => {
        if (this.storageAdapter) {
          await this.storageAdapter.setItem(this.storageName, dataToSave);
        }
      },
      this.reactionOptions,
    );

    this.isPersisting = true;

    consoleDebug(this.debugMode, `${this.storageName} - (startPersisting) isPersisting:`, this.isPersisting);
  }

  public pausePersisting(): void {
    this.isPersisting = false;

    consoleDebug(this.debugMode, `${this.storageName} - pausePersisting (isPersisting):`, this.isPersisting);

    if (this.cancelWatch) {
      this.cancelWatch();
      this.cancelWatch = null;
    }
  }

  public stopPersisting(): void {
    this.pausePersisting();

    consoleDebug(this.debugMode, `${this.storageName} - (stopPersisting)`);

    PersistStoreMap.delete(this.target);

    this.cancelWatch = null;
    this.properties = [];
    this.reactionOptions = {};
    this.storageAdapter = null;
    this.target = null;
  }

  public async clearPersistedStore(): Promise<void> {
    if (this.storageAdapter) {
      consoleDebug(this.debugMode, `${this.storageName} - (clearPersistedStore)`);

      await this.storageAdapter.removeItem(this.storageName);
    }
  }

  public async getPersistedStore<T extends Record<string, any>>(): Promise<T | null> {
    if (this.storageAdapter) {
      consoleDebug(this.debugMode, `${this.storageName} - (getPersistedStore)`);

      // @ts-ignore
      return this.storageAdapter.getItem(this.storageName);
    }

    return null;
  }
}
