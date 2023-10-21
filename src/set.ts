import { Comparable } from './comparable';
import { DeepMap } from './map';
import { Options } from './options';

/**
 * A Set implementation that supports deep equality for values.
 */
export class DeepSet<V, TxV = V> extends Set<V> implements Comparable<DeepSet<V, TxV>> {
    // Just piggy-back on a DeepMap that uses null values
    private readonly map: DeepMap<V, null, TxV, null>;

    // NOTE: This is actually a thin wrapper. We're not using super other than to drive the (typed) API contract.
    /**
     * @param values optional list of values to initialize the set
     * @param options configuration options
     */
    constructor(values?: readonly V[] | null, private options?: Options<V, null, TxV, null>) {
        super();
        const transformedEntries = values ? values.map((el) => [el, null] as const) : null;
        this.map = new DeepMap(transformedEntries, options);
    }

    /**
     * Getter for number of elements in the set.
     * @inheritdoc
     */
    override get size(): number {
        return this.map.size;
    }

    /**
     * Returns true if the given value is present in the set.
     * @inheritdoc
     */
    override has(val: V): boolean {
        return this.map.has(val);
    }

    /**
     * @inheritdoc
     */
    override add(val: V): this {
        this.map.set(val, null);
        return this;
    }

    /**
     * @inheritdoc
     */
    override delete(val: V): boolean {
        return this.map.delete(val);
    }

    /**
     * Clear all values from the map.
     * @inheritdoc
     */
    override clear(): void {
        this.map.clear();
    }

    /**
     * @inheritdoc
     */
    override forEach(callbackfn: (val: V, val2: V, set: Set<V>) => void): void {
        this.map.forEach((_mapVal, mapKey, _map) => {
            callbackfn(mapKey, mapKey, this);
        });
    }

    /**
     * @inheritdoc
     */
    override *[Symbol.iterator](): IterableIterator<V> {
        for (const [key, _val] of this.map[Symbol.iterator]()) {
            yield key;
        }
    }

    /**
     * @inheritdoc
     */
    override *entries(): IterableIterator<[V, V]> {
        for (const val of this[Symbol.iterator]()) {
            yield [val, val];
        }
    }

    /**
     * @inheritdoc
     */
    override *keys(): IterableIterator<V> {
        for (const val of this[Symbol.iterator]()) {
            yield val;
        }
    }

    /**
     * @inheritdoc
     */
    override *values(): IterableIterator<V> {
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

    /**
     * @returns a new set whose values are the union of `this` and `other`.
     *
     * NOTE: If both maps prescribe the same key, the value from `other` will be retained.
     */
    union(other: this): DeepSet<V, TxV> {
        return this.getSetFromMapKeys(this.map.union(other['map']));
    }

    /**
     * @returns a new set containing all values in `this` that are also in `other`.
     */
    intersection(other: this): DeepSet<V, TxV> {
        return this.getSetFromMapKeys(this.map.intersection(other['map']));
    }

    /**
     * @returns a new set containing all values in `this` that are not also in `other`.
     */
    difference(other: this): DeepSet<V, TxV> {
        return this.getSetFromMapKeys(this.map.difference(other['map']));
    }

    private getSetFromMapKeys(map: DeepMap<V, null, TxV, null>): DeepSet<V, TxV> {
        return new DeepSet([...map.keys()], this.options);
    }
}
