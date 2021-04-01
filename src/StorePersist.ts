import {
  action,
  IReactionDisposer,
  isAction,
  isComputedProp,
  makeObservable,
  observable,
  reaction,
  runInAction,
  toJS,
} from 'mobx';
import { StorageConfiguration } from './StorageConfiguration';
import { PersistenceStorageOptions, ReactionOptions } from './types';
import { StorageAdapter } from './StorageAdapter';
import { mpsConfig, mpsReactionOptions } from './configurePersistable';
import { invalidStorageAdaptorWarningIf, isDefined, isObject } from './utils';

export class StorePersist<T, P extends keyof T> {
  private cancelWatch: IReactionDisposer | null = null;
  private properties: string[] = [];
  private reactionOptions: ReactionOptions = {};
  private storageAdapter: StorageAdapter | null = null;
  private target: T | null = null;

  public isHydrated = false;
  public isPersisting = false;
  public readonly storageName: string = '';

  constructor(target: T, options: PersistenceStorageOptions<P>, reactionOptions: ReactionOptions = {}) {
    this.target = target;
    this.storageName = options.name;
    this.properties = options.properties as string[];
    this.reactionOptions = Object.assign({ fireImmediately: true }, mpsReactionOptions, reactionOptions);
    this.storageAdapter = new StorageAdapter({
      expireIn: isDefined(options.expireIn) ? options.expireIn : mpsConfig.expireIn,
      removeOnExpiration: isDefined(options.removeOnExpiration)
        ? options.removeOnExpiration
        : mpsConfig.removeOnExpiration,
      stringify: isDefined(options.stringify) ? options.stringify : mpsConfig.stringify,
      storage: isDefined(options.storage) ? options.storage : mpsConfig.storage,
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

    invalidStorageAdaptorWarningIf(!isObject(this.storageAdapter.options.storage), this.storageName);

    this.init();
  }

  private async init() {
    await this.hydrateStore();
    this.startPersisting();
  }

  public async hydrateStore(): Promise<void> {
    // If the user calls stopPersist and then rehydrateStore we don't want to automatically call startPersist below
    const isBeingWatched = Boolean(this.cancelWatch);

    this.pausePersisting();

    runInAction(() => {
      this.isHydrated = false;
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
              target[propertyName] = data[propertyName];
            }
          });
        });
      }
    }

    runInAction(() => {
      this.isHydrated = true;
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

          if (isComputedProperty) {
            console.warn(`The property '${propertyName}'  is computed and will not persist.`);
          } else if (isActionProperty) {
            console.warn(`The property '${propertyName}'  is an action and will not persist.`);
          }

          if (!isComputedProperty && !isActionProperty) {
            propertiesToWatch[propertyName] = toJS(target[propertyName]);
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
  }

  public pausePersisting(): void {
    this.isPersisting = false;

    if (this.cancelWatch) {
      this.cancelWatch();
      this.cancelWatch = null;
    }
  }

  public async clearPersistedStore(): Promise<void> {
    if (this.storageAdapter) {
      await this.storageAdapter.removeItem(this.storageName);
    }
  }

  public stopPersisting(): void {
    this.pausePersisting();

    StorageConfiguration.delete(this.target);

    this.cancelWatch = null;
    this.properties = [];
    this.reactionOptions = {};
    this.storageAdapter = null;
    this.target = null;
  }
}
