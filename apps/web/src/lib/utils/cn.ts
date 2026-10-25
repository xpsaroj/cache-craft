export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[];

export function cn(...values: ClassValue[]): string {
  return values
    .flatMap((value): ClassValue[] =>
      Array.isArray(value) ? value : [value],
    )
    .filter(
      (value): value is string | number =>
        value !== null && value !== undefined && value !== false,
    )
    .join(" ");
}
