import { isComputedProp, isObservableProp } from "mobx";

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

export function getObjectKeys<ObjectType>(target: ObjectType):  (keyof ObjectType)[] {
  return Object.keys(target) as (keyof ObjectType)[];
}

export function getObservableTargetObject<T extends Object>(target: T, properties: (keyof T)[]) {
  return properties.reduce((result, property) => {
    const observableProperty = isObservableProp(target, String(property));
    const computedProperty = isComputedProp(target, String(property));

    if (!observableProperty || computedProperty) {
      if (computedProperty) {
        console.warn('The property `' + property + '` is computed and will not persist.');
        return result;
      }

      console.warn('The property `' + property + '` is not observable and not affected reaction, but will persist.');
    }

    if (target.hasOwnProperty(property)) {
      let value: T[keyof T] | any[] = target[property]

      if (Array.isArray(value)) {
        value = value.slice()
      }

      return { ...result, [property]: target[property] };
    }

    return result;
  }, {} as T);
}