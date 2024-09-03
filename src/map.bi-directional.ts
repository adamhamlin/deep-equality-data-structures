import { DeepMap } from './map';
import { Normalized } from './normalizer';
import { Options } from './options';
import { stringify } from './utils';

/**
 * A DeepMap implementation that supports O(1) lookups by both keys and values
 * NOTE: All key-value pairs must be 1-to-1
 */
export class BiDirectionalDeepMap<K, V, TxK = K, TxV = V> extends DeepMap<K, V, TxK, TxV> {
    private readonly valueMap: Map<Normalized<TxV>, K>;

    /**
     * @param entries optional list of key-value pairs to initialize the map
     * @param options configuration options
     */
    constructor(entries?: readonly (readonly [K, V])[] | null, options?: Options<K, V, TxK, TxV>) {
        super(entries, options);
        const valueEntries = entries ? entries.map(([key, val]) => [this.normalizeValue(val), key] as const) : null;
        this.valueMap = new Map(valueEntries);
    }

    /**
     * @inheritdoc
     */
    override set(key: K, val: V): this {
        // Enforce 1-to-1: Don't allow writing a value which is already present in the map for a different key
        const preexistingValueKey = this.getKeyByValue(val);
        if (preexistingValueKey !== undefined && this.normalizeKey(preexistingValueKey) !== this.normalizeKey(key)) {
            throw new Error(
                `Could not set key='${stringify(key)}': The value='${stringify(
                    val
                )}' is already associated with key='${stringify(preexistingValueKey)}'`
            );
        }
        this.valueMap.set(this.normalizeValue(val), key);
        return super.set(key, val);
    }

    /**
     * @inheritdoc
     */
    override delete(key: K): boolean {
        const val = this.get(key);
        if (val) {
            this.valueMap.delete(this.normalizeValue(val));
        }
        return super.delete(key);
    }

    /**
     * @inheritdoc
     */
    override clear(): void {
        this.valueMap.clear();
        super.clear();
    }

    // BI-DIRECTIONAL API

    /**
     * @returns true if the given value is present in the key-value map.
     */
    hasValue(val: V): boolean {
        return this.valueMap.has(this.normalizeValue(val));
    }

    /**
     * @returns the key associated with the specified value
     */
    getKeyByValue(val: V): K | undefined {
        return this.valueMap.get(this.normalizeValue(val));
    }

    /**
     * @returns true if a value in the map existed and has been removed, else false
     */
    deleteByValue(val: V): boolean {
        const key = this.getKeyByValue(val);
        return key ? this.delete(key) : false;
    }
}
