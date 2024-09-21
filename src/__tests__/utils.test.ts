import { chain, stringify } from '../utils';

describe('utils.ts', () => {
    describe('#stringify', () => {
        it('stringifies non-object values', async () => {
            expect(stringify(45)).toBe('45');
            expect(stringify('45')).toBe('45');
            expect(stringify(true)).toBe('true');
            expect(stringify(null)).toBe('null');
            expect(stringify(undefined)).toBe('undefined');
        });

        it('stringifies object values', async () => {
            expect(stringify({})).toBe('{}');
            expect(stringify({ hi: 'bye' })).toBe('{"hi":"bye"}');
            expect(stringify(['dog', 'cat'])).toBe('["dog","cat"]');
        });

        it('stringifies object values which have an overridden toString method', async () => {
            expect(stringify(new RegExp('some_regexp', 'g'))).toBe('/some_regexp/g');
        });
    });

    describe('#chain', () => {
        it('invokes each function in the list with the return value of the previous', async () => {
            const chained = chain([
                (arg: number) => arg + 100,
                (arg: number) => arg * -1,
                (arg: number) => `Hello, ${arg}!`,
            ]);
            expect(chained(4)).toBe('Hello, -104!');
        });

        it('a single function is invoked as is', async () => {
            const chained = chain([(arg: number) => arg + 100]);
            expect(chained(4)).toBe(104);
        });
    });
});
