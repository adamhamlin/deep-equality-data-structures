import { NormalOption as ObjectHashOptions } from 'object-hash';

import { Transformers, TransformFunction } from './transformers';
import { Require } from './utils';

/**
 * Library options
 */
interface DeepEqualityDataStructuresOptions<K, V, TxK, TxV> {
    /**
     * A function that transforms Map keys or Set values prior to normalization.
     *
     * NOTE: The caller is responsible for not mutating object inputs.
     */
    transformer?: TransformFunction<K, TxK>;

    /**
     * A function that transforms Map values prior to normalization.
     *
     * NOTE: The caller is responsible for not mutating object inputs.
     */
    mapValueTransformer?: TransformFunction<V, TxV>;

    /**
     * If true, objects will be JSON-serialized/deserialized into "plain" objects prior to hashing.
     */
    useToJsonTransform?: boolean;

    /**
     * If true, all string values (including keys/values within objects and arrays) will use case-insensitive equality comparisons.
     */
    caseInsensitive?: boolean;
}

export type Options<K, V, TxK, TxV> = ObjectHashOptions & DeepEqualityDataStructuresOptions<K, V, TxK, TxV>;

/**
 * Given the specified options, resolve default values as appropriate.
 */
export function getOptionsWithDefaults<K, V, TxK, TxV>(
    options: Options<K, V, TxK, TxV>
): Require<Options<K, V, TxK, TxV>, keyof DeepEqualityDataStructuresOptions<K, V, TxK, TxV>> {
    return {
        // Default options
        algorithm: 'md5' as const, // not a cryptographic usage, who cares
        transformer: Transformers.identity,
        mapValueTransformer: Transformers.identity,
        useToJsonTransform: false,
        caseInsensitive: false,
        // Supplied options
        ...options,
    };
}
