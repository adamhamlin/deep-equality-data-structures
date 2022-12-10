/**
 * Require the keys K from T if optional.
 */
export type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };
