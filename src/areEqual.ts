import { DeepEqualityDataStructuresError } from './errors';
import { Options } from './options';
import { DeepSet } from './set';

/**
 * Static utility for doing a one-time equality check across the provided values.
 * @param values list whose elements will be compared to each other
 * @param options configuration options
 * @returns true if every element in `values` is equal to every other element
 * @throws {Error} if `values` list is empty
 */
export function areEqual<V, TxV = V>(values: V[], options?: Options<V, null, TxV, null>): boolean {
    if (values.length === 0) {
        throw new DeepEqualityDataStructuresError('Empty values list passed to areEqual function');
    }
    const set = new DeepSet(values, options);
    return set.size === 1;
}
