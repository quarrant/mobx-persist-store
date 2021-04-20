import { mpsConfig } from './configurePersistable';

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

const isBrowser = typeof window !== 'undefined';
const isNotProductionBuild = process.env.NODE_ENV !== 'production';

export const invalidStorageAdaptorWarningIf = (invalidStorageAdaptor: boolean, storageName: string): void => {
  if (invalidStorageAdaptor && isBrowser && isNotProductionBuild) {
    console.warn(
      `mobx-persist-store: ${storageName} does not have a valid storage adaptor and data will not be persisted. Please set "storage:" `
    );
  }
};

export const duplicatedStoreWarningIf = (hasPersistedStoreAlready: boolean, storageName: string): void => {
  if (hasPersistedStoreAlready && isBrowser && isNotProductionBuild) {
    console.warn(
      `mobx-persist-store: 'makePersistable' was called was called with the same storage name "${storageName}".\n\n * Make sure you call "stopPersisting" before recreating "${storageName}" to avoid memory leaks. \n * Or double check you did not have two stores with the same name.`
    );
  }
};

export const computedPersistWarningIf = (isComputedProperty: boolean, propertyName: string): void => {
  if (isComputedProperty && isBrowser && isNotProductionBuild) {
    console.warn(`mobx-persist-store: The property '${propertyName}' is computed and will not persist.`);
  }
};

export const actionPersistWarningIf = (isComputedProperty: boolean, propertyName: string): void => {
  if (isComputedProperty && isBrowser && isNotProductionBuild) {
    console.warn(`mobx-persist-store: The property '${propertyName}' is an action and will not persist.`);
  }
};

export const consoleDebug = (message: string, content: any = ''): void => {
  if (mpsConfig.debug && isBrowser && isNotProductionBuild) {
    console.info(
      `%c mobx-persist-store: (Debug Mode) ${message} `,
      'background: #4B8CC5; color: black; display: block;',
      content
    );
  }
};
