export function JSONParse<ReturnType>(json: string): ReturnType | undefined {
  let ret = undefined;
  try {
    ret = JSON.parse(json)
  } catch (error) {
    console.warn('JSON Parse error', { json, error })
  } finally {
    return ret
  }
}