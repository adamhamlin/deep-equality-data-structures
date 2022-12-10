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

        describe('Configurable options', () => {
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

            describe('options.transformer', () => {
                it('Can define a transformer function', () => {
                    type Blah = { val: number };
                    const a: Blah = { val: 1 };
                    const b: Blah = { val: 3 };
                    expect(n.normalizeKey(a)).not.toBe(n.normalizeKey(b));
                    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                    const transformer = (obj: Blah) => {
                        return { val: obj.val % 2 };
                    };
                    const withTransformer = new Normalizer({ transformer });
                    expect(withTransformer.normalizeKey(a)).toBe(withTransformer.normalizeKey(b));
                });
            });

            describe('options.mapValueTransformer', () => {
                it('Can define a mapValueTransformer function', () => {
                    type Blah = { val: number };
                    const a: Blah = { val: 1 };
                    const b: Blah = { val: 3 };
                    expect(n.normalizeValue(a)).not.toBe(n.normalizeValue(b));
                    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                    const mapValueTransformer = (obj: Blah) => {
                        return { val: obj.val % 2 };
                    };
                    const withTransformer = new Normalizer({ mapValueTransformer });
                    expect(withTransformer.normalizeValue(a)).toBe(withTransformer.normalizeValue(b));
                });
            });

            describe('options.useToJsonTransform', () => {
                it('Can specify useToJsonTransform setting', () => {
                    class A {
                        constructor(public x: number) {}
                    }
                    class B {
                        constructor(public x: number) {}
                    }
                    const a = new A(45);
                    const b = new B(45);
                    expect(n.normalizeKey(a)).not.toBe(n.normalizeKey(b));
                    const withToJson = new Normalizer({ useToJsonTransform: true });
                    expect(withToJson.normalizeKey(a)).toBe(withToJson.normalizeKey(b));
                    expect(withToJson.normalizeValue(a)).toBe(withToJson.normalizeValue(b));
                });
            });
        });
    });
});
