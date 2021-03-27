// A function that performs no operations.
export const noop = Function.prototype as <T>(...params: T[]) => T;

export const delay = (durationInMilliseconds: number = 250): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, durationInMilliseconds));
};

export const buildExpireTimestamp = (milliseconds: number): number => {
  return new Date().getTime() + milliseconds;
};

export const hasTimestampExpired = (milliseconds: number): boolean => {
  if (isNaN(milliseconds)) {
    return false;
  }

  return new Date(milliseconds).getTime() > new Date().getTime();
};
