import hash, { NormalOption as ObjectHashOptions } from 'object-hash';

import { getOptionsWithDefaults, Options } from './options';
import { Transformers, TransformFunction } from './transformers';
import { chain } from './utils';

/**
 * Result of object-hash hashing function
 */
type HashedObject = string;

/**
 * Type for normalized input.
 */
export type Normalized<T> = HashedObject | T;

/**
 * Class that normalizes object types to strings via hashing
 */
export class Normalizer<K, V, TxK, TxV> {
    private readonly objectHashOptions: ObjectHashOptions;
    private readonly caseInsensitive: boolean;
    private readonly keyTransformer: TransformFunction<K, TxK>;
    private readonly valueTransformer: TransformFunction<V, TxV>;

    constructor(options: Options<K, V, TxK, TxV> = {}) {
        const { transformer, mapValueTransformer, useToJsonTransform, caseInsensitive, ...objectHashOptions } =
            getOptionsWithDefaults(options);
        this.objectHashOptions = objectHashOptions;
        this.caseInsensitive = caseInsensitive;
        this.keyTransformer = useToJsonTransform
            ? chain([Transformers.jsonSerializeDeserialize, transformer])
            : transformer;
        this.valueTransformer = useToJsonTransform
            ? chain([Transformers.jsonSerializeDeserialize, mapValueTransformer])
            : mapValueTransformer;

        if (caseInsensitive) {
            // NOTE: This block ensures case-insensitivity inside objects only.
            // See normalizeHelper() for logic which handles primitive strings
            const caseInsensitiveReplacer = <T>(val: T): T =>
                typeof val === 'string' ? (val.toLowerCase() as T) : val;
            const { replacer } = this.objectHashOptions;
            this.objectHashOptions.replacer = replacer
                ? chain([caseInsensitiveReplacer, replacer])
                : caseInsensitiveReplacer;
        }
    }

    /**
     * Normalize the input by transforming and then hashing the result (if an object)
     * @param input the input to normalize
     * @returns the normalized result
     */
    normalizeKey(input: K): Normalized<TxK> {
        return this.normalizeHelper(this.keyTransformer(input));
    }

    /**
     * Normalize the input by transforming and then hashing the result (if an object)
     * @param input the input to normalize
     * @returns the normalized result
     */
    normalizeValue(input: V): Normalized<TxV> {
        return this.normalizeHelper(this.valueTransformer(input));
    }

    private normalizeHelper<Input>(input: Input): Normalized<Input> {
        if (Normalizer.isObject(input)) {
            return hash(input, this.objectHashOptions);
        } else if (this.caseInsensitive && typeof input === 'string') {
            return input.toLowerCase();
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
