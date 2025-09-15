export function getEnumJoin<TEnum extends Record<string, number | string>>(
  EnumType: TEnum,
): string {
  return Object.keys(EnumType)
    .filter((key) => isNaN(Number(key)))
    .map((key) => `${key} = ${EnumType[key as keyof typeof EnumType]}`)
    .join(', ');
}
