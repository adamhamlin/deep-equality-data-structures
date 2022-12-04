import hash from 'object-hash';

import { getHashStr } from '../hash';

jest.mock('object-hash', () => {
    const origModule = jest.requireActual('object-hash');
    return {
        __esModule: true,
        ...origModule,
        default: jest.fn((...args: unknown[]) => origModule(...args)),
    };
});

describe('../hash.ts', () => {
    describe('getHashStr', () => {
        it('Sanity checks', async () => {
            // Positive
            expect(getHashStr({})).toBe(getHashStr({}));
            expect(getHashStr({ a: 'hi', b: 'bye' })).toBe(getHashStr({ b: 'bye', a: 'hi' }));
            expect(getHashStr(['blah'])).toBe(getHashStr(['blah']));
            // Negative
            expect(getHashStr({ a: 'hi', b: 'bye' })).not.toBe(getHashStr({ a: 'hi' }));
            expect(getHashStr({ a: 'hi', b: 'bye' })).not.toBe(getHashStr({ a: 'hi', b: 'bye bye' }));
            expect(getHashStr(['bleep', 'bloop'])).not.toBe(getHashStr(['bloop', 'bleep']));
        });

        it('Uses MD5 as default algorithm', async () => {
            getHashStr({});
            expect(hash).toHaveBeenCalledWith({}, { algorithm: 'md5' });
        });

        it('Uses specified algorithm', async () => {
            getHashStr({}, { algorithm: 'sha1' });
            expect(hash).toHaveBeenCalledWith({}, { algorithm: 'sha1' });
        });
    });
});
