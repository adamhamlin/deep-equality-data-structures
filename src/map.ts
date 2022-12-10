import { Comparable } from './comparable';
import { Normalized, Normalizer } from './normalizer';
import { Options } from './options';

/**
 * A key-value pair
 */
interface KeyValuePair<K, V> {
    key: K;
    val: V;
}

/**
 * A Map implementation that supports deep equality for object keys.
 */
export class DeepMap<K, V> extends Map<K, V> implements Comparable<DeepMap<K, V>> {
    private readonly normalizer: Normalizer<K, V>;
    private readonly map: Map<Normalized<K>, KeyValuePair<K, V>>;

    // NOTE: This is actually a thin wrapper. We're not using super other than to drive the (typed) API contract.
    constructor(entries?: readonly (readonly [K, V])[] | null, options: Options<K, V> = {}) {
        super();
        this.normalizer = new Normalizer(options);
        const transformedEntries = entries
            ? entries.map(([key, val]) => [this.normalizeKey(key), { key, val }] as const)
            : null;
        this.map = new Map(transformedEntries);
    }

    /**
     * Getter for number of kev-value pairs in the map.
     */
    override get size(): number {
        return this.map.size;
    }

    /**
     * Returns true if the given key is present in the map.
     */
    override has(key: K): boolean {
        return this.map.has(this.normalizeKey(key));
    }

    /**
     * Store the given key-value pair.
     */
    override set(key: K, val: V): this {
        this.map.set(this.normalizeKey(key), { key, val });
        return this;
    }

    /**
     * Get the value associated with key. Otherwise, undefined.
     */
    override get(key: K): V | undefined {
        return this.map.get(this.normalizeKey(key))?.val;
    }

    /**
     * Delete the value associated with key.
     */
    override delete(key: K): boolean {
        return this.map.delete(this.normalizeKey(key));
    }

    /**
     * Clear all key-value pairs from the map.
     */
    override clear(): void {
        this.map.clear();
    }

    /**
     * Standard forEach function.
     */
    override forEach(callbackfn: (val: V, key: K, map: Map<K, V>) => void): void {
        this.map.forEach((pair, _key, _internalMap) => {
            callbackfn(pair.val, pair.key, this);
        });
    }

    /**
     * Map iterator
     *
     * @yields the next key-value pair in the map
     */
    override *[Symbol.iterator](): IterableIterator<[K, V]> {
        for (const [_hashStr, pair] of this.map[Symbol.iterator]()) {
            yield [pair.key, pair.val];
        }
    }

    /**
     * Map iterator. Equivalent to Symbol.iterator.
     *
     * @yields the next key-value pair in the map
     */
    override *entries(): IterableIterator<[K, V]> {
        for (const entry of this[Symbol.iterator]()) {
            yield entry;
        }
    }

    /**
     * Map keys iterator
     *
     * @yields the next key in the map
     */
    override *keys(): IterableIterator<K> {
        for (const [key, _val] of this[Symbol.iterator]()) {
            yield key;
        }
    }

    /**
     * Map values iterator
     *
     * @yields the next value in the map
     */
    override *values(): IterableIterator<V> {
        for (const [_key, val] of this[Symbol.iterator]()) {
            yield val;
        }
    }

    /**
     * @returns true if the entries of `other` are the same as this map
     */
    equals(other: this): boolean {
        return this.size === other.size && this.contains(other);
    }

    /**
     * @returns true if the entries of `other` are all contained in this map
     */
    contains(other: this): boolean {
        return [...other.entries()].every(([otherKey, otherVal]) => {
            const thisVal = this.get(otherKey);
            return thisVal !== undefined && this.normalizeValue(thisVal) === this.normalizeValue(otherVal);
        });
    }

    // PRIVATE METHODS FOLLOW...

    private normalizeKey(input: K): Normalized<K> {
        return this.normalizer.normalizeKey(input);
    }

    private normalizeValue(input: V): Normalized<V> {
        return this.normalizer.normalizeValue(input);
    }
}
