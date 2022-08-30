import { StorageController } from './types';

export const buildExpireTimestamp = (milliseconds: number): number => {
  return new Date().getTime() + milliseconds;
};

export const hasTimestampExpired = (milliseconds: number): boolean => {
  const dateTimeNow = new Date().getTime();
  const dateTimeExpiration = new Date(milliseconds).getTime();

  return dateTimeExpiration <= dateTimeNow;
};

export const isDefined = <T>(t: T | null | undefined): t is T => t != null;

/**
 * Check if the data is an object.
 */
export const isObject = (data: any): boolean => {
  return Boolean(data) && Array.isArray(data) === false && typeof data === 'object';
};

/**
 * Check the data is an object with properties.
 */
export const isObjectWithProperties = (data: any): boolean => {
  return isObject(data) && Object.keys(data).length > 0;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isFunction = (functionToCheck: any): boolean => {
  return functionToCheck && functionToCheck instanceof Function;
};

export const isStorageControllerLike = (value: StorageController | Storage | undefined): value is StorageController => {
  // "typeof Storage" fixes issue with React Native
  if (typeof Storage !== 'undefined' && value instanceof Storage) {
    return true;
  }

  return [
    value?.hasOwnProperty('getItem'),
    value?.hasOwnProperty('removeItem'),
    value?.hasOwnProperty('setItem'),
    isFunction(value?.getItem),
    isFunction(value?.removeItem),
    isFunction(value?.setItem),
  ].every(Boolean);
};

const isBrowser = typeof window !== 'undefined';
const isNotProductionBuild = process.env.NODE_ENV !== 'production';

export const invalidStorageAdaptorWarningIf = (
  storageAdaptor: StorageController | undefined,
  storageName: string
): void => {
  if (isBrowser && isNotProductionBuild && !isStorageControllerLike(storageAdaptor)) {
    console.warn(
      `mobx-persist-store: ${storageName} does not have a valid storage adaptor.\n\n* Make sure the storage controller has 'getItem', 'setItem' and 'removeItem' methods."`
    );
  }
};

export const duplicatedStoreWarningIf = (hasPersistedStoreAlready: boolean, storageName: string): void => {
  if (isBrowser && isNotProductionBuild && hasPersistedStoreAlready) {
    console.warn(
      `mobx-persist-store: 'makePersistable' was called was called with the same storage name "${storageName}".\n\n * Make sure you call "stopPersisting" before recreating "${storageName}" to avoid memory leaks. \n * Or double check you did not have two stores with the same name.`
    );
  }
};

export const computedPersistWarningIf = (isComputedProperty: boolean, propertyName: string): void => {
  if (isBrowser && isNotProductionBuild && isComputedProperty) {
    console.warn(`mobx-persist-store: The property '${propertyName}' is computed and will not persist.`);
  }
};

export const actionPersistWarningIf = (isComputedProperty: boolean, propertyName: string): void => {
  if (isBrowser && isNotProductionBuild && isComputedProperty) {
    console.warn(`mobx-persist-store: The property '${propertyName}' is an action and will not persist.`);
  }
};

export const consoleDebug = (isDebugMode: boolean, message: string, content: any = ''): void => {
  if (isDebugMode && isBrowser && isNotProductionBuild) {
    console.info(
      `%c mobx-persist-store: (Debug Mode) ${message} `,
      'background: #4B8CC5; color: black; display: block;',
      content
    );
  }
};

export const isArrayForMap = (value: unknown): value is [any, any][] => {
  if (Array.isArray(value)) {
    return value.every((v) => Array.isArray(v));
  }

  return false;
};
