/**
 * Interface for comparable maps/sets
 */
export interface Comparable<T> {
    equals(other: T): boolean;
    contains(other: T): boolean;
    union(other: T): T;
    intersection(other: T): T;
    difference(other: T): T;
}
