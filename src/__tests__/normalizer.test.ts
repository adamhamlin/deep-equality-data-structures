import hash from 'object-hash';

import { Normalizer } from '../normalizer';

jest.mock('object-hash', () => {
    const origModule = jest.requireActual('object-hash');
    return {
        __esModule: true,
        ...origModule,
        default: jest.fn((...args: unknown[]) => origModule(...args)),
    };
});

describe('../normalizer.ts', () => {
    const n = new Normalizer();

    describe('normalize', () => {
        it('object-hash sanity checks', async () => {
            // Positive
            expect(n.normalizeKey({})).toBe(n.normalizeKey({}));
            expect(n.normalizeKey({ a: 'hi', b: 'bye' })).toBe(n.normalizeKey({ b: 'bye', a: 'hi' }));
            expect(n.normalizeKey(['blah'])).toBe(n.normalizeKey(['blah']));
            // Negative
            expect(n.normalizeKey({ a: 'hi', b: 'bye' })).not.toBe(n.normalizeKey({ a: 'hi' }));
            expect(n.normalizeKey({ a: 'hi', b: 'bye' })).not.toBe(n.normalizeKey({ a: 'hi', b: 'bye bye' }));
            expect(n.normalizeKey(['bleep', 'bloop'])).not.toBe(n.normalizeKey(['bloop', 'bleep']));
        });

        it('primitive inputs are normalized to themselves', async () => {
            expect(n.normalizeKey(5)).toBe(5);
            expect(n.normalizeKey('hi')).toBe('hi');
            expect(n.normalizeKey(true)).toBe(true);
            expect(n.normalizeKey(null)).toBeNull();
            expect(n.normalizeKey(undefined)).toBeUndefined();
        });

        describe('Unobservable options', () => {
            // Just testing pass-thru of object-hash library options, since we can't validate some things
            // based on the result
            describe('options.algorithm', () => {
                it('Uses MD5 as default algorithm', async () => {
                    n.normalizeKey({});
                    expect(hash).toHaveBeenCalledWith({}, { algorithm: 'md5' });
                });

                it('Uses specified algorithm', async () => {
                    const n = new Normalizer({ algorithm: 'sha1' });
                    n.normalizeKey({});
                    expect(hash).toHaveBeenCalledWith({}, { algorithm: 'sha1' });
                });
            });
        });
    });
});
