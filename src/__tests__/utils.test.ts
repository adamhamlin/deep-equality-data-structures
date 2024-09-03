import { stringify } from '../utils';

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
});
