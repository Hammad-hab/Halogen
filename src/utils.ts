function deepMerge(target: any, source: any) {
  const output = { ...target };

  for (const key in source) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (
      typeof sourceVal === "object" &&
      sourceVal !== null &&
      !Array.isArray(sourceVal) &&
      typeof targetVal === "object" &&
      targetVal !== null &&
      !Array.isArray(targetVal)
    ) {
      output[key] = deepMerge(targetVal, sourceVal);
    } else {
      output[key] = sourceVal;
    }
  }

  return output;
}
export { deepMerge }