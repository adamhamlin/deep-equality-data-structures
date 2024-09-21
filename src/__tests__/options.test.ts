import { areEqual } from '../areEqual';
import { DeepMap } from '../map';
import { getOptionsWithDefaults } from '../options';
import { Transformers } from '../transformers';

describe('options.ts', () => {
    describe('#getOptionsWithDefaults', () => {
        it('baseline/default values', async () => {
            expect(getOptionsWithDefaults({})).toStrictEqual({
                algorithm: 'md5',
                transformer: Transformers.identity,
                mapValueTransformer: Transformers.identity,
                useToJsonTransform: false,
                caseInsensitive: false,
            });
        });

        it('specified values override default values', async () => {
            expect(
                getOptionsWithDefaults({
                    algorithm: 'sha1',
                    useToJsonTransform: true,
                    caseInsensitive: true,
                })
            ).toStrictEqual({
                algorithm: 'sha1',
                transformer: Transformers.identity,
                mapValueTransformer: Transformers.identity,
                useToJsonTransform: true,
                caseInsensitive: true,
            });
        });
    });

    describe('All Options', () => {
        // NOTE: For clarity/succinctness, we'll just test everything using areEqual(...)

        describe('#transformer', () => {
            type MyObject = { key: string; other: string };
            const a = { key: 'value', other: 'a' };
            const b = { key: 'value', other: 'b' };
            const c = { key: 'value', other: 'c' };
            const opts = {
                transformer: (obj: MyObject): string => obj.key,
            };

            it('Without transformer', async () => {
                expect(areEqual([a, b])).toBe(false);
                expect(areEqual([a, b, c])).toBe(false);
            });

            it('With transformer', async () => {
                expect(areEqual([a, b], opts)).toBe(true);
                expect(areEqual([a, b, c], opts)).toBe(true);
            });
        });

        describe('#mapValueTransformer', () => {
            // NOTE: areEqual(...) uses a DeepSet under the covers, so need to use DeepMap explicitly for these tests
            type MyValueObject = { mapValue: number };
            type MyMapEntries = Array<[number, MyValueObject]>;
            const mapEntries1 = [[1, { mapValue: 4 }]] as MyMapEntries;
            const mapEntries2 = [[1, { mapValue: 6 }]] as MyMapEntries;
            const opts = {
                mapValueTransformer: (obj: MyValueObject): number => obj.mapValue % 2,
            };

            it('Without mapValueTransformer', async () => {
                const map1 = new DeepMap(mapEntries1);
                const map2 = new DeepMap(mapEntries2);
                expect(map1.equals(map2)).toBe(false);
            });

            it('With mapValueTransformer', async () => {
                const map1 = new DeepMap(mapEntries1, opts);
                const map2 = new DeepMap(mapEntries2, opts);
                expect(map1.equals(map2)).toBe(true);
            });
        });

        describe('#useToJsonTransform', () => {
            class A {
                constructor(public a: number) {}
            }
            class B extends A {}
            class C extends A {}

            const b = new B(45);
            const c = new C(45);

            it('Without useToJsonTransform', async () => {
                expect(areEqual([b, c])).toBe(false);
            });

            it('With useToJsonTransform', async () => {
                expect(areEqual([b, c], { useToJsonTransform: true })).toBe(true);
            });
        });

        describe('#caseInsensitive', () => {
            it('Without caseInsensitive', async () => {
                expect(areEqual(['hi', 'HI'])).toBe(false);
                expect(areEqual([['hi'], ['HI']])).toBe(false);
                expect(areEqual([{ prop: 'hi' }, { Prop: 'HI' }])).toBe(false);
                expect(areEqual([{ prop: ['hi'] }, { Prop: ['HI'] }])).toBe(false);
            });

            it('With caseInsensitive', async () => {
                const opts = { caseInsensitive: true };
                expect(areEqual(['hi', 'HI'], opts)).toBe(true);
                expect(areEqual([['hi'], ['HI']], opts)).toBe(true);
                expect(areEqual([{ prop: 'hi' }, { Prop: 'HI' }], opts)).toBe(true);
                expect(areEqual([{ prop: ['hi'] }, { Prop: ['HI'] }], opts)).toBe(true);
            });
        });

        describe('Using multiple options simultaneously', () => {
            it('caseInsensitive + replacer', () => {
                // NOTE: caseInsensitive leverages the replacer option under the covers
                const opts = {
                    caseInsensitive: true,
                    // eslint-disable-next-line jest/no-conditional-in-test
                    replacer: (val: unknown) => (typeof val === 'string' ? val.trimEnd() : val),
                };
                expect(areEqual([{ word: 'blah' }, { WORD: 'Blah    ' }], opts)).toBe(true);
            });

            it('useToJsonTransform + transformer', () => {
                // NOTE: useToJsonTransform leverages the transformer option under the covers
                class A {
                    constructor(public val: number) {}
                }
                class B {
                    constructor(public val: number) {}
                }
                const opts = {
                    useToJsonTransform: true,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    transformer: (val: any) => val.constructor.name,
                };
                expect(areEqual([new A(1), new B(2)], opts)).toBe(true);
            });
        });
    });
});
