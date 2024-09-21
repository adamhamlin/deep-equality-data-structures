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

/**
 * Chain a list of functions
 * @returns a function that accepts the args of the first function in the functions list. Each subsequent function is invoked with
 * the return value of the previous function.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function chain<TArgs extends any[], T1>(
    functions: [(...args: TArgs) => T1] // prettier nudge
): (...args: TArgs) => T1;
export function chain<TArgs extends any[], T1, T2>(
    functions: [(...args: TArgs) => T1, (arg: T1) => T2] // prettier nudge
): (...args: TArgs) => T2;
export function chain<TArgs extends any[], T1, T2, T3>(
    functions: [(...args: TArgs) => T1, (arg: T1) => T2, (arg: T2) => T3]
): (...args: TArgs) => T3;
export function chain<TArgs extends any[], T1, T2, T3, T4>(
    functions: [(...args: TArgs) => T1, (arg: T1) => T2, (arg: T2) => T3, (arg: T3) => T4]
): (...args: TArgs) => T4;
export function chain<TArgs extends any[], T1, T2, T3, T4, T5>(
    functions: [(...args: TArgs) => T1, (arg: T1) => T2, (arg: T2) => T3, (arg: T3) => T4, (arg: T4) => T5]
): (...args: TArgs) => T5;
export function chain<TArgs extends any[]>(
    functions: [(...args: TArgs) => any, ...Array<(arg: any) => any>]
): (...args: TArgs) => any {
    const [head, ...tail] = functions;
    return (...args: TArgs) => {
        return tail.reduce((acc, fn) => fn(acc), head(...args));
    };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
