import { areEqual } from '../areEqual';

/**
 * NOTE: areEqual relies on the use of a DeepSet, so we won't exhaustively cover the different equality scenarios.
 */
describe('areEqual', () => {
    describe('Using object values', () => {
        const a = { key: 'value' };
        const b = { key: 'value' };
        const c = { key: 'value' };
        const d = { key: 'otherValue' };

        it('Returns true when all values are equal', async () => {
            expect(areEqual([a, b])).toBe(true);
            expect(areEqual([b, c])).toBe(true);
            expect(areEqual([a, b, c])).toBe(true);
            expect(areEqual([a])).toBe(true); // we'll define this as vacuously true
        });

        it('Returns false when all values are not equal', async () => {
            expect(areEqual([a, d])).toBe(false);
            expect(areEqual([b, d])).toBe(false);
            expect(areEqual([a, b, c, d])).toBe(false);
        });
    });

    describe('Using primitive values', () => {
        const a = 'value';
        const b = 'value';
        const c = 'value';
        const d = 'otherValue';

        it('Returns true when all values are equal', async () => {
            expect(areEqual([a, b])).toBe(true);
            expect(areEqual([b, c])).toBe(true);
            expect(areEqual([a, b, c])).toBe(true);
            expect(areEqual([a])).toBe(true); // we'll define this as vacuously true
        });

        it('Returns false when all values are not equal', async () => {
            expect(areEqual([a, d])).toBe(false);
            expect(areEqual([b, d])).toBe(false);
            expect(areEqual([a, b, c, d])).toBe(false);
        });
    });

    describe('Using options', () => {
        type MyObject = { key: string; other: string };
        const a = { key: 'value', other: 'a' };
        const b = { key: 'value', other: 'b' };
        const c = { key: 'value', other: 'c' };
        const opts = {
            transformer: (obj: MyObject): string => obj.key,
        };

        it('Returns true when all values are equal according to transformer', async () => {
            expect(areEqual([a, b])).toBe(false);
            expect(areEqual([a, b, c])).toBe(false);
            // Now, with the transformer option
            expect(areEqual([a, b], opts)).toBe(true);
            expect(areEqual([a, b, c], opts)).toBe(true);
        });
    });

    describe('Misc', () => {
        it('Throws error when passing empty list of values', async () => {
            expect(() => areEqual([])).toThrow('Empty values list passed to areEqual function');
        });
    });
});
