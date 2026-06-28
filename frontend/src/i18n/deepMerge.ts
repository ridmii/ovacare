type PlainObject = Record<string, unknown>

export function deepMerge<T extends PlainObject>(base: T, overrides: Partial<T>): T {
  const result = { ...base } as PlainObject

  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const overrideValue = overrides[key]
    const baseValue = base[key]

    if (
      overrideValue &&
      typeof overrideValue === 'object' &&
      !Array.isArray(overrideValue) &&
      baseValue &&
      typeof baseValue === 'object' &&
      !Array.isArray(baseValue)
    ) {
      result[key as string] = deepMerge(
        baseValue as PlainObject,
        overrideValue as PlainObject
      )
    } else if (overrideValue !== undefined) {
      result[key as string] = overrideValue
    }
  }

  return result as T
}

export function cloneTranslation<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
