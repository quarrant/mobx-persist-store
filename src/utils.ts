export const buildExpireTimestamp = (milliseconds: number): number => {
  return new Date().getTime() + milliseconds;
};

export const hasTimestampExpired = (milliseconds: number): boolean => {
  const dateTimeNow = new Date().getTime();
  const dateTimeExpiration = new Date(milliseconds).getTime();

  return dateTimeExpiration <= dateTimeNow;
};
