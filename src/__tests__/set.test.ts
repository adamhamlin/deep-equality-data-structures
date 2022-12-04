import { DeepSet } from '../set';
import { TestObjectField, TestObject } from './common/test.utils';

describe('DeepSet', () => {
    describe('Construct new map', () => {
        it('No entries argument/empty', async () => {
            const set = new DeepSet<TestObject>();
            expect(set.size).toBe(0);
            expect([...set.entries()]).toStrictEqual([]);
            expect([...set.keys()]).toStrictEqual([]);
            expect([...set.values()]).toStrictEqual([]);
        });

        it('Pass entries agrument', async () => {
            const key1 = new TestObject('test', /abc/, new TestObjectField('test'));
            const key2 = new TestObject('test', /def/, new TestObjectField('test'));
            const key2Duplicate = new TestObject('test', /def/, new TestObjectField('test'));
            const set = new DeepSet<TestObject>([
                key1,
                key2,
                key2Duplicate, // duplicate value, last one wins
            ]);
            expect(set.size).toBe(2);
            expect([...set.entries()]).toStrictEqual([
                [key1, key1],
                [key2, key2],
            ]);
            expect([...set.keys()]).toStrictEqual([key1, key2]);
            expect([...set.values()]).toStrictEqual([key1, key2]);
        });
    });

    describe('Basic usage scenario', () => {
        // NOTE: All tests in this describe are dependent on each other/cannot be run individually.
        const set = new DeepSet<TestObject>();
        const key1 = new TestObject('test', /abc/, new TestObjectField('test1'));
        const key2 = new TestObject('test', /abc/, new TestObjectField('test2'));

        it('Create the set', async () => {
            expect(set.size).toBe(0);
            expect(set.has(key1)).toBe(false);
            expect(set.has(key2)).toBe(false);
            expect([...set.entries()]).toStrictEqual([]);
        });

        it('Add some values', async () => {
            set.add(key1);
            expect(set.size).toBe(1);
            expect(set.has(key1)).toBe(true);
            expect(set.has(key2)).toBe(false);
            expect([...set.values()]).toStrictEqual([key1]);
            // Add another
            set.add(key2);
            expect(set.size).toBe(2);
            expect(set.has(key1)).toBe(true);
            expect(set.has(key2)).toBe(true);
            expect([...set.values()]).toStrictEqual([key1, key2]);
        });

        it('Check values', async () => {
            expect(set.has(key1)).toBe(true);
            expect(set.has(key2)).toBe(true);
            const unknownKey = new TestObject('unknown', /abc/, new TestObjectField('test1'));
            expect(set.has(unknownKey)).toBe(false);
        });

        it('Iterate using forEach', async () => {
            const result: TestObject[] = [];
            set.forEach((val, _val2, thisSet) => {
                result.push(val);
                expect(thisSet).toBe(set);
            });
            expect(result).toStrictEqual([key1, key2]);
        });

        it('Iterate using iterator', async () => {
            const iterator = set[Symbol.iterator]();
            let result = iterator.next();
            expect(result.done).toBe(false);
            expect(result.value).toStrictEqual(key1);
            result = iterator.next();
            expect(result.done).toBe(false);
            expect(result.value).toStrictEqual(key2);
            result = iterator.next();
            expect(result.done).toBe(true);
            expect(result.value).toBeUndefined();
        });

        it('Adding value already in set has no effect', async () => {
            const duplicateKey1 = new TestObject('test', /abc/, new TestObjectField('test1'));
            set.add(duplicateKey1);

            expect(set.size).toBe(2);
            expect(set.has(duplicateKey1)).toBe(true);
            expect(set.has(key2)).toBe(true);
            // NOTE: Original key ordering is preserved--even tho key1's value was overwritten
            expect([...set.values()]).toStrictEqual([key1, key2]);
        });

        it('Delete a value', async () => {
            expect(set.delete(key1)).toBe(true);
            expect(set.size).toBe(1);
            expect([...set.values()]).toStrictEqual([key2]);
            // No change other than return value if attempt to delete same key again
            expect(set.delete(key1)).toBe(false);
            expect(set.size).toBe(1);
            expect([...set.values()]).toStrictEqual([key2]);
        });

        it('Clear the set', async () => {
            set.clear();
            expect(set.size).toBe(0);
            expect(set.has(key1)).toBe(false);
            expect([...set.values()]).toStrictEqual([]);
        });
    });

    describe('Primitive values', () => {
        it('numbers', async () => {
            const set = new DeepSet([1, 2, 3, 3]);
            expect(set.size).toBe(3);
            expect([...set.values()]).toStrictEqual([1, 2, 3]);
            expect(set.has(3)).toBe(true);
            expect(set.has(999)).toBe(false);
        });

        it('strings', async () => {
            const set = new DeepSet(['a', 'b', 'c', 'c']);
            expect(set.size).toBe(3);
            expect([...set.values()]).toStrictEqual(['a', 'b', 'c']);
            expect(set.has('c')).toBe(true);
            expect(set.has('zzz')).toBe(false);
        });
    });

    describe('Comparable Interface', () => {
        class A {
            constructor(public a: string) {}
        }

        describe('equals method', () => {
            it('two sets with the same values are equal', async () => {
                const set1 = new DeepSet([new A('1'), new A('2'), new A('3')]);
                const set2 = new DeepSet([new A('3'), new A('1'), new A('2')]);
                expect(set1.equals(set2)).toBe(true);
            });

            it('two empty sets are equal', async () => {
                const set1 = new DeepSet();
                const set2 = new DeepSet();
                expect(set1.equals(set2)).toBe(true);
            });

            it('two sets with different values are not equal', async () => {
                const set1 = new DeepSet([new A('1'), new A('2'), new A('3')]);
                const set2 = new DeepSet([new A('2'), new A('3'), new A('4')]);
                expect(set1.equals(set2)).toBe(false);
            });

            it('sets with a different number of values are not equal', async () => {
                const set1 = new DeepSet([new A('1'), new A('2'), new A('3')]);
                const set2 = new DeepSet([new A('1'), new A('2')]);
                expect(set1.equals(set2)).toBe(false);
            });
        });

        describe('contains method', () => {
            it('a set contains another set if they are equal', async () => {
                const set1 = new DeepSet([new A('1'), new A('2'), new A('3')]);
                const set2 = new DeepSet([new A('3'), new A('1'), new A('2')]);
                expect(set1.contains(set2)).toBe(true);
            });

            it('a set contains another set if all values in the latter are in the former', async () => {
                const set1 = new DeepSet([new A('1'), new A('2'), new A('3')]);
                const set2 = new DeepSet([new A('2'), new A('1')]);
                expect(set1.contains(set2)).toBe(true);
                // THe reverse is not true
                expect(set2.contains(set1)).toBe(false);
            });

            it('a set contains another set if the latter is empty', async () => {
                const set1 = new DeepSet([new A('1'), new A('2'), new A('3')]);
                const set2 = new DeepSet<A>();
                expect(set1.contains(set2)).toBe(true);
            });

            it('a set does not contain another if any value in the latter is not present in the former', async () => {
                const set1 = new DeepSet([new A('1'), new A('2'), new A('3')]);
                const set2 = new DeepSet([new A('2'), new A('3'), new A('4')]);
                expect(set1.contains(set2)).toBe(false);
            });
        });
    });

    describe('Hash Options', () => {
        describe('jsonSerializableOnly', () => {
            class A {
                constructor(public a: number) {}
            }
            class B extends A {}
            class C extends A {}

            const b = new B(45);
            const c = new C(45);

            it('jsonSerializableOnly=false', async () => {
                const set = new DeepSet([b, c]);
                expect(set.size).toBe(2);
            });

            it('jsonSerializableOnly=true', async () => {
                const set = new DeepSet([b, c], { jsonSerializableOnly: true });
                expect(set.size).toBe(1);
            });
        });
    });
});
