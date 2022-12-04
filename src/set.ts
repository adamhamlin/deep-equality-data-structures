import { Comparable } from './comparable';
import { HashOptions } from './hash';
import { DeepMap } from './map';

/**
 * A Set implementation that supports deep equality for values.
 */
export class DeepSet<T> extends Set<T> implements Comparable<DeepSet<T>> {
    // Just piggy-back on a DeepMap that uses null values
    private readonly map: DeepMap<T, null>;

    // NOTE: This is actually a thin wrapper. We're not using super other than to drive the (typed) API contract.
    constructor(values?: readonly T[] | null, options?: HashOptions) {
        super();
        const transformedEntries = values ? values.map((el) => [el, null] as const) : null;
        this.map = new DeepMap(transformedEntries, options);
    }

    /**
     * Getter for number of elements in the set.
     */
    override get size(): number {
        return this.map.size;
    }

    /**
     * Returns true if the given value is present in the set.
     */
    override has(key: T): boolean {
        return this.map.has(key);
    }

    /**
     * Store the given value.
     */
    override add(val: T): this {
        this.map.set(val, null);
        return this;
    }

    /**
     * Deletes the specified value.
     */
    override delete(val: T): boolean {
        return this.map.delete(val);
    }

    /**
     * Clear all values from the map.
     */
    override clear(): void {
        this.map.clear();
    }

    /**
     * Standard forEach function.
     */
    override forEach(callbackfn: (val: T, val2: T, set: Set<T>) => void): void {
        this.map.forEach((_mapVal, mapKey, _map) => {
            callbackfn(mapKey, mapKey, this);
        });
    }

    /**
     * Set iterator
     *
     * @yields the next value in the set
     */
    override *[Symbol.iterator](): IterableIterator<T> {
        for (const [key, _val] of this.map[Symbol.iterator]()) {
            yield key;
        }
    }

    /**
     * Set iterator. Equivalent to Symbol.iterator.
     *
     * @yields the next value-value pair in the set
     */
    override *entries(): IterableIterator<[T, T]> {
        for (const val of this[Symbol.iterator]()) {
            yield [val, val];
        }
    }

    /**
     * Set keys iterator. Equivalent to this.values().
     *
     * @yields the next key in the map
     */
    override *keys(): IterableIterator<T> {
        for (const val of this[Symbol.iterator]()) {
            yield val;
        }
    }

    /**
     * Set values iterator. Equivalent to this.keys().
     *
     * @yields the next value in the map
     */
    override *values(): IterableIterator<T> {
        yield* this.keys();
    }

    /**
     * @returns true if the values of `other` are the same as this set
     */
    equals(other: this): boolean {
        return this.map.equals(other['map']);
    }

    /**
     * @returns true if the values of `other` are all contained in this set
     */
    contains(other: this): boolean {
        return this.map.contains(other['map']);
    }
}
