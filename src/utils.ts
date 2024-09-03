/**
 * Require the keys K from T if optional.
 */
export type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Format an unknown value to a string for display
 */
export function stringify(value: unknown): string {
    if (value !== null && typeof value === 'object') {
        // For objects, defer an overridden toString, otherwise use JSON.stringify
        return 'toString' in value && ![Object.prototype.toString, Array.prototype.toString].includes(value.toString)
            ? value.toString()
            : JSON.stringify(value);
    } else {
        return String(value);
    }
}
