import {
  action,
  IReactionDisposer,
  isAction,
  isComputedProp,
  makeObservable,
  observable,
  ObservableMap,
  ObservableSet,
  reaction,
  runInAction,
  toJS,
} from 'mobx';
import { PersistStoreMap } from './PersistStoreMap';
import { PersistenceStorageOptions, ReactionOptions } from './types';
import { StorageAdapter } from './StorageAdapter';
import { mpsConfig, mpsReactionOptions } from './configurePersistable';
import { makeSerializableProperties, SerializableProperty } from './serializableProperty';
import {
  actionPersistWarningIf,
  computedPersistWarningIf,
  consoleDebug,
  invalidStorageAdaptorWarningIf,
  isArrayForMap,
  isArrayForSet,
} from './utils';

export class PersistStore<T, P extends keyof T> {
  private cancelWatch: IReactionDisposer | null = null;
  private properties: SerializableProperty<T, P>[] = [];
  private reactionOptions: ReactionOptions = {};
  private storageAdapter: StorageAdapter | null = null;
  private target: T | null = null;
  private version: number | undefined = undefined;
  private readonly debugMode: boolean = false;

  public isHydrated = false;
  public isPersisting = false;
  public readonly storageName: string = '';

  constructor(target: T, options: PersistenceStorageOptions<T, P>, reactionOptions: ReactionOptions = {}) {
    this.target = target;
    this.storageName = options.name;
    this.version = options.version ?? mpsConfig.version;
    this.properties = makeSerializableProperties(options.properties);
    this.reactionOptions = Object.assign({ fireImmediately: true }, mpsReactionOptions, reactionOptions);
    this.debugMode = options.debugMode ?? mpsConfig.debugMode ?? false;
    this.storageAdapter = new StorageAdapter({
      version: this.version,
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
      { autoBind: true, deep: false }
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
      const data: Record<P, unknown> | undefined = await this.storageAdapter.getItem<Record<P, unknown>>(
        this.storageName
      );

      // Reassigning so TypeScript doesn't complain (Object is possibly 'null') about this.target within forEach
      const target: any = this.target;

      if (data) {
        runInAction(() => {
          this.properties.forEach((property) => {
            const allowPropertyHydration = [
              target.hasOwnProperty(property.key),
              typeof data[property.key] !== 'undefined',
            ].every(Boolean);

            if (allowPropertyHydration) {
              const propertyData = data[property.key];

              if (target[property.key] instanceof ObservableMap && isArrayForMap(propertyData)) {
                target[property.key] = property.deserialize(new Map(propertyData));
              } else if (target[property.key] instanceof ObservableSet && isArrayForSet(propertyData)) {
                target[property.key] = property.deserialize(new Set(propertyData));
              } else {
                target[property.key] = property.deserialize(propertyData);
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
        const propertiesToWatch = {} as Record<P, unknown>;

        this.properties.forEach((property) => {
          const isComputedProperty = isComputedProp(target, property.key);
          const isActionProperty = isAction(target[property.key]);

          computedPersistWarningIf(isComputedProperty, String(property.key));
          actionPersistWarningIf(isActionProperty, String(property.key));

          if (!isComputedProperty && !isActionProperty) {
            let propertyData = property.serialize(target[property.key]);

            if (propertyData instanceof ObservableMap) {
              const mapArray: any = [];
              propertyData.forEach((v, k) => {
                mapArray.push([k, toJS(v)]);
              });
              propertyData = mapArray;
            } else if (propertyData instanceof ObservableSet) {
              propertyData = Array.from(propertyData).map(toJS);
            }

            propertiesToWatch[property.key] = toJS(propertyData);
          }
        });

        return propertiesToWatch;
      },
      async (dataToSave) => {
        if (this.storageAdapter) {
          await this.storageAdapter.setItem(this.storageName, dataToSave);
        }
      },
      this.reactionOptions
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
