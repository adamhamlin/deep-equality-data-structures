import hash, { NormalOption as ObjectHashOptions } from 'object-hash';

import { getOptionsWithDefaults, Options } from './options';
import { Transformers, TransformFunction } from './transformers';

/**
 * Result of object-hash hashing function
 */
type HashedObject = string;

/**
 * Type for normalized input.
 */
export type Normalized<T> = HashedObject | T | ReturnType<TransformFunction<T>>;

/**
 * Class that normalizes object types to strings via hashing
 */
export class Normalizer<K, V> {
    private readonly objectHashOptions: ObjectHashOptions;
    private readonly keyTransformer: TransformFunction<K>;
    private readonly valueTransformer: TransformFunction<V>;

    constructor(options: Options<K, V> = {}) {
        const { transformer, mapValueTransformer, useToJsonTransform, ...objectHashOptions } =
            getOptionsWithDefaults(options);
        this.keyTransformer = useToJsonTransform ? Transformers.jsonSerializeDeserialize : transformer;
        this.valueTransformer = useToJsonTransform ? Transformers.jsonSerializeDeserialize : mapValueTransformer;
        this.objectHashOptions = objectHashOptions;
    }

    /**
     * Normalize the input by transforming and then hashing the result (if an object)
     * @param input the input to normalize
     * @returns the normalized result
     */
    normalizeKey(input: K): Normalized<K> {
        return this.normalizeHelper(this.keyTransformer(input));
    }

    /**
     * Normalize the input by transforming and then hashing the result (if an object)
     * @param input the input to normalize
     * @returns the normalized result
     */
    normalizeValue(input: V): Normalized<V> {
        return this.normalizeHelper(this.valueTransformer(input));
    }

    private normalizeHelper<Input>(input: Input): Normalized<Input> {
        if (Normalizer.isObject(input)) {
            return hash(input, this.objectHashOptions);
        } else {
            // Primitive value, don't hash
            return input;
        }
    }

    /**
     * Returns true if the input is a javascript object.
     */
    private static isObject(input: unknown): input is object {
        return typeof input === 'object' && input !== null;
    }
}
