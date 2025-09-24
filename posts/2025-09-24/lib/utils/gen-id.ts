export const genId = <T extends string>(): T => {
  return Math.random().toString(36).slice(2) as T
}
