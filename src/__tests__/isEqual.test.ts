import { isEqual } from '../isEqual';

/**
 * NOTE: isEqual relies on the use of a DeepSet, so we won't exhaustively cover the different equality scenarios.
 */
describe('isEqual', () => {
    describe('Using object values', () => {
        const a = { key: 'value' };
        const b = { key: 'value' };
        const c = { key: 'value' };
        const d = { key: 'otherValue' };

        it('Returns true when all values are equal', async () => {
            expect(isEqual([a, b])).toBe(true);
            expect(isEqual([b, c])).toBe(true);
            expect(isEqual([a, b, c])).toBe(true);
            expect(isEqual([a])).toBe(true); // we'll define this as vacuously true
        });

        it('Returns false when all values are not equal', async () => {
            expect(isEqual([a, d])).toBe(false);
            expect(isEqual([b, d])).toBe(false);
            expect(isEqual([a, b, c, d])).toBe(false);
        });
    });

    describe('Using primitive values', () => {
        const a = 'value';
        const b = 'value';
        const c = 'value';
        const d = 'otherValue';

        it('Returns true when all values are equal', async () => {
            expect(isEqual([a, b])).toBe(true);
            expect(isEqual([b, c])).toBe(true);
            expect(isEqual([a, b, c])).toBe(true);
            expect(isEqual([a])).toBe(true); // we'll define this as vacuously true
        });

        it('Returns false when all values are not equal', async () => {
            expect(isEqual([a, d])).toBe(false);
            expect(isEqual([b, d])).toBe(false);
            expect(isEqual([a, b, c, d])).toBe(false);
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
            expect(isEqual([a, b])).toBe(false);
            expect(isEqual([a, b, c])).toBe(false);
            // Now, with the transformer option
            expect(isEqual([a, b], opts)).toBe(true);
            expect(isEqual([a, b, c], opts)).toBe(true);
        });
    });

    describe('Misc', () => {
        it('Throws error when passing empty list of values', async () => {
            expect(() => isEqual([])).toThrow('Empty values list passed to isEqual function');
        });
    });
});
