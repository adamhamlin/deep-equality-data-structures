import { Comparable } from './comparable';
import { DeepEqualityDataStructuresError } from './errors';
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
export class DeepMap<K, V, TxK = K, TxV = V> extends Map<K, V> implements Comparable<DeepMap<K, V, TxK, TxV>> {
    private readonly normalizer: Normalizer<K, V, TxK, TxV>;
    private readonly map: Map<Normalized<TxK>, KeyValuePair<K, V>>;

    // NOTE: This is actually a thin wrapper. We're not using super other than to drive the (typed) API contract.
    /**
     * @param entries optional list of key-value pairs to initialize the map
     * @param options configuration options
     */
    constructor(entries?: readonly (readonly [K, V])[] | null, private options: Options<K, V, TxK, TxV> = {}) {
        super();
        this.normalizer = new Normalizer(options);
        const transformedEntries = entries
            ? entries.map(([key, val]) => [this.normalizeKey(key), { key, val }] as const)
            : null;
        this.map = new Map(transformedEntries);
    }

    /**
     * Getter for number of kev-value pairs in the map.
     * @inheritdoc
     */
    override get size(): number {
        return this.map.size;
    }

    /**
     * Returns true if the given key is present in the map.
     * @inheritdoc
     */
    override has(key: K): boolean {
        return this.map.has(this.normalizeKey(key));
    }

    /**
     * @inheritdoc
     */
    override set(key: K, val: V): this {
        this.map.set(this.normalizeKey(key), { key, val });
        return this;
    }

    /**
     * @inheritdoc
     */
    override get(key: K): V | undefined {
        return this.map.get(this.normalizeKey(key))?.val;
    }

    /**
     * @inheritdoc
     */
    override delete(key: K): boolean {
        return this.map.delete(this.normalizeKey(key));
    }

    /**
     * Clear all key-value pairs from the map.
     * @inheritdoc
     */
    override clear(): void {
        this.map.clear();
    }

    /**
     * @inheritdoc
     */
    override forEach(callbackfn: (val: V, key: K, map: Map<K, V>) => void): void {
        this.map.forEach((pair, _key, _internalMap) => {
            callbackfn(pair.val, pair.key, this);
        });
    }

    /**
     * @yields the next key-value pair in the map
     * @inheritdoc
     */
    override *[Symbol.iterator](): IterableIterator<[K, V]> {
        for (const [_hashStr, pair] of this.map[Symbol.iterator]()) {
            yield [pair.key, pair.val];
        }
    }

    /**
     * @yields the next key-value pair in the map
     * @inheritdoc
     */
    override *entries(): IterableIterator<[K, V]> {
        for (const entry of this[Symbol.iterator]()) {
            yield entry;
        }
    }

    /**
     * @inheritdoc
     */
    override *keys(): IterableIterator<K> {
        for (const [key, _val] of this[Symbol.iterator]()) {
            yield key;
        }
    }

    /**
     * @inheritdoc
     */
    override *values(): IterableIterator<V> {
        for (const [_key, val] of this[Symbol.iterator]()) {
            yield val;
        }
    }

    /**
     * @param other the map to compare against
     * @returns true if the entries of `other` are the same as this map
     */
    equals(other: this): boolean {
        this.validateUsingSameOptionsAs(other);
        return this.size === other.size && this.contains(other);
    }

    /**
     * @param other the map to compare against
     * @returns true if the entries of `other` are all contained in this map
     */
    contains(other: this): boolean {
        this.validateUsingSameOptionsAs(other);
        return [...other.entries()].every(([key, val]) => this.keyValuePairIsPresentIn(key, val, this));
    }

    /**
     * @param other the map to compare against
     * @returns a new map whose keys are the union of keys between `this` and `other` maps.
     *
     * NOTE: If both maps prescribe the same key, the key-value pair from `this` will be retained.
     */
    union(other: this): DeepMap<K, V, TxK, TxV> {
        this.validateUsingSameOptionsAs(other);
        return new DeepMap([...other.entries(), ...this.entries()], this.options);
    }

    /**
     * @param other the map to compare against
     * @returns a new map containing all key-value pairs in `this` that are also present in `other`.
     */
    intersection(other: this): DeepMap<K, V, TxK, TxV> {
        this.validateUsingSameOptionsAs(other);

        const intersectingPairs = [...this.entries()].filter(([key, val]) =>
            this.keyValuePairIsPresentIn(key, val, other)
        );
        return new DeepMap(intersectingPairs, this.options);
    }

    /**
     * @param other the map to compare against
     * @returns a new map containing all key-value pairs in `this` that are not present in `other`.
     */
    difference(other: this): DeepMap<K, V, TxK, TxV> {
        this.validateUsingSameOptionsAs(other);

        const differencePairs = [...this.entries()].filter(
            ([key, val]) => !this.keyValuePairIsPresentIn(key, val, other)
        );
        return new DeepMap(differencePairs, this.options);
    }

    // PRIVATE/PROTECTED METHODS FOLLOW...

    protected normalizeKey(input: K): Normalized<TxK> {
        return this.normalizer.normalizeKey(input);
    }

    protected normalizeValue(input: V): Normalized<TxV> {
        return this.normalizer.normalizeValue(input);
    }

    private validateUsingSameOptionsAs(other: this): void {
        if (this.normalizer.getOptionsChecksum() !== other['normalizer'].getOptionsChecksum()) {
            throw new DeepEqualityDataStructuresError(
                'Structures must use same options for Comparable interface operations'
            );
        }
    }

    /**
     * @returns true if the key is present in the provided map w/ the specified value
     */
    private keyValuePairIsPresentIn(key: K, val: V, mapToCheck: this): boolean {
        const checkVal = mapToCheck.get(key);
        return checkVal !== undefined && this.normalizeValue(checkVal) === this.normalizeValue(val);
    }
}
