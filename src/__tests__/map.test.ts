import { DeepMap } from '../map';
import { TestObjectField, TestObject } from './common/test.utils';

describe('DeepMap', () => {
    describe('Construct new map', () => {
        it('No entries argument/empty', async () => {
            const map = new DeepMap<TestObject, string>();
            expect(map.size).toBe(0);
            expect([...map.entries()]).toStrictEqual([]);
            expect([...map.keys()]).toStrictEqual([]);
            expect([...map.values()]).toStrictEqual([]);
        });

        it('Pass entries agrument', async () => {
            const key1 = new TestObject('test', /abc/, new TestObjectField('test'));
            const key2 = new TestObject('test', /def/, new TestObjectField('test'));
            const key2Duplicate = new TestObject('test', /def/, new TestObjectField('test'));
            const map = new DeepMap<TestObject, number>([
                [key1, 1],
                [key2, 999],
                [key2Duplicate, 2], // duplicate key, last one wins
            ]);
            expect(map.size).toBe(2);
            expect([...map.entries()]).toStrictEqual([
                [key1, 1],
                [key2, 2],
            ]);
            expect([...map.keys()]).toStrictEqual([key1, key2]);
            expect([...map.values()]).toStrictEqual([1, 2]);
        });
    });

    describe('Basic usage scenario', () => {
        // NOTE: All tests in this describe are dependent on each other/cannot be run individually.
        const map = new DeepMap<TestObject, number>();
        const key1 = new TestObject('test', /abc/, new TestObjectField('test1'));
        const key2 = new TestObject('test', /abc/, new TestObjectField('test2'));

        it('Create the map', async () => {
            expect(map.size).toBe(0);
            expect(map.has(key1)).toBe(false);
            expect(map.has(key2)).toBe(false);
            expect([...map.entries()]).toStrictEqual([]);
        });

        it('Add some keys', async () => {
            map.set(key1, 1);
            expect(map.size).toBe(1);
            expect(map.has(key1)).toBe(true);
            expect(map.has(key2)).toBe(false);
            expect([...map.entries()]).toStrictEqual([[key1, 1]]);
            // Add another
            map.set(key2, 2);
            expect(map.size).toBe(2);
            expect(map.has(key1)).toBe(true);
            expect(map.has(key2)).toBe(true);
            expect([...map.entries()]).toStrictEqual([
                [key1, 1],
                [key2, 2],
            ]);
        });

        it('Get values', async () => {
            expect(map.get(key1)).toBe(1);
            expect(map.get(key2)).toBe(2);
            const unknownKey = new TestObject('unknown', /abc/, new TestObjectField('test1'));
            expect(map.get(unknownKey)).toBeUndefined();
        });

        it('Iterate using forEach', async () => {
            const result: Array<[TestObject, number]> = [];
            map.forEach((val, key, thisMap) => {
                result.push([key, val + 1000]);
                expect(thisMap).toBe(map);
            });
            expect(result).toStrictEqual([
                [key1, 1001],
                [key2, 1002],
            ]);
        });

        it('Iterate using iterator', async () => {
            const iterator = map[Symbol.iterator]();
            let result = iterator.next();
            expect(result.done).toBe(false);
            expect(result.value).toStrictEqual([key1, 1]);
            result = iterator.next();
            expect(result.done).toBe(false);
            expect(result.value).toStrictEqual([key2, 2]);
            result = iterator.next();
            expect(result.done).toBe(true);
            expect(result.value).toBeUndefined();
        });

        it('Setting key with same deep equality overwrites existing value', async () => {
            const duplicateKey1 = new TestObject('test', /abc/, new TestObjectField('test1'));
            map.set(duplicateKey1, 999);

            expect(map.size).toBe(2);
            expect(map.has(duplicateKey1)).toBe(true);
            expect(map.has(key2)).toBe(true);
            expect(map.get(duplicateKey1)).toBe(999);
            // NOTE: Original key ordering is preserved--even tho key1's value was overwritten
            expect([...map.entries()]).toStrictEqual([
                [duplicateKey1, 999],
                [key2, 2],
            ]);

            // Same assertions as above using original key1
            expect(map.has(key1)).toBe(true);
            expect(map.get(key1)).toBe(999);
            expect([...map.entries()]).toStrictEqual([
                [key1, 999],
                [key2, 2],
            ]);
        });

        it('Delete a key', async () => {
            expect(map.delete(key1)).toBe(true);
            expect(map.size).toBe(1);
            expect([...map.entries()]).toStrictEqual([[key2, 2]]);
            // No change other than return value if attempt to delete same key again
            expect(map.delete(key1)).toBe(false);
            expect(map.size).toBe(1);
            expect([...map.entries()]).toStrictEqual([[key2, 2]]);
        });

        it('Clear the map', async () => {
            map.clear();
            expect(map.size).toBe(0);
            expect(map.has(key1)).toBe(false);
            expect(map.get(key1)).toBeUndefined();
            expect([...map.entries()]).toStrictEqual([]);
        });
    });

    describe('Comparable Interface', () => {
        class K {
            constructor(public a: string) {}
        }
        class V {
            constructor(public b: string) {}
        }

        describe('equals method', () => {
            it('two maps with the same key-value pairs are equal', async () => {
                const map1 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                    [new K('3'), new V('3')],
                ]);
                const map2 = new DeepMap([
                    [new K('3'), new V('3')],
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                ]);
                expect(map1.equals(map2)).toBe(true);
            });

            it('two empty maps are equal', async () => {
                const map1 = new DeepMap();
                const map2 = new DeepMap();
                expect(map1.equals(map2)).toBe(true);
            });

            it('two maps with different keys are not equal', async () => {
                const map1 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                    [new K('3'), new V('3')],
                ]);
                const map2 = new DeepMap([
                    [new K('2'), new V('1')],
                    [new K('3'), new V('2')],
                    [new K('4'), new V('3')],
                ]);
                expect(map1.equals(map2)).toBe(false);
            });

            it('two maps with the same keys but different values are not equal', async () => {
                const map1 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                    [new K('3'), new V('3')],
                ]);
                const map2 = new DeepMap([
                    [new K('1'), new V('2')],
                    [new K('2'), new V('3')],
                    [new K('3'), new V('4')],
                ]);
                expect(map1.equals(map2)).toBe(false);
            });

            it('maps with a different number of key-value pairs are not equal', async () => {
                const map1 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                ]);
                const map2 = new DeepMap([[new K('1'), new V('1')]]);
                expect(map1.equals(map2)).toBe(false);
            });
        });

        describe('contains method', () => {
            it('a map contains another map if they are equal', async () => {
                const map1 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                    [new K('3'), new V('3')],
                ]);
                const map2 = new DeepMap([
                    [new K('3'), new V('3')],
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                ]);
                expect(map1.contains(map2)).toBe(true);
                expect(map2.contains(map1)).toBe(true);
            });

            it('a map contains another map if all key-value pairs in the latter are in the former', async () => {
                const map1 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                    [new K('3'), new V('3')],
                ]);
                const map2 = new DeepMap([
                    [new K('2'), new V('2')],
                    [new K('1'), new V('1')],
                ]);
                expect(map1.contains(map2)).toBe(true);
                // THe reverse is not true
                expect(map2.contains(map1)).toBe(false);
            });

            it('a map contains another map if the latter is empty', async () => {
                const map1 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                    [new K('3'), new V('3')],
                ]);
                const map2 = new DeepMap<K, V>();
                expect(map1.contains(map2)).toBe(true);
            });

            it('a map does not contain another map if any key-value pair in the latter is not present in the former', async () => {
                const map1 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                    [new K('3'), new V('3')],
                ]);
                const map2 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                    [new K('3'), new V('3')],
                    [new K('4'), new V('4')],
                ]);
                expect(map1.contains(map2)).toBe(false);
            });
        });

        describe('union method', () => {
            it('the union of two maps contains all key-value pairs from first map and any unique keys from second map', async () => {
                const map1 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                ]);
                const map2 = new DeepMap([
                    [new K('2'), new V('999')],
                    [new K('3'), new V('3')],
                ]);
                const unionMap = map1.union(map2);
                expect([...unionMap.entries()]).toStrictEqual([
                    [new K('2'), new V('2')], // value for common key is the value from the caller
                    [new K('3'), new V('3')],
                    [new K('1'), new V('1')],
                ]);
            });

            it('the union of equal maps is the same as either input', async () => {
                const map1 = new DeepMap([[new K('1'), new V('1')]]);
                const map2 = new DeepMap([[new K('1'), new V('1')]]);
                expect(map1.equals(map2)).toBe(true);
                const unionMap = map1.union(map2);
                expect([...unionMap.entries()]).toStrictEqual([[new K('1'), new V('1')]]);
            });

            it('the union of map and an empty map is the first map', async () => {
                const map1 = new DeepMap([[new K('1'), new V('1')]]);
                const map2 = new DeepMap<K, V>();
                const unionMap = map1.union(map2);
                expect([...unionMap.entries()]).toStrictEqual([[new K('1'), new V('1')]]);
            });
        });

        describe('intersection method', () => {
            it('the intersection of two maps contains all shared key-value pairs', async () => {
                const map1 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                    [new K('3'), new V('3')],
                ]);
                const map2 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('999')], // same key but different value -- not a match
                    [new K('4'), new V('4')],
                ]);
                const intersectionMap = map1.intersection(map2);
                expect([...intersectionMap.entries()]).toStrictEqual([[new K('1'), new V('1')]]);
            });

            it('the intersection of equal maps is the same as either input', async () => {
                const map1 = new DeepMap([[new K('1'), new V('1')]]);
                const map2 = new DeepMap([[new K('1'), new V('1')]]);
                expect(map1.equals(map2)).toBe(true);
                const intersectionMap = map1.intersection(map2);
                expect([...intersectionMap.entries()]).toStrictEqual([[new K('1'), new V('1')]]);
            });

            it('the intersection of map and an empty map is an empty map', async () => {
                const map1 = new DeepMap([[new K('1'), new V('1')]]);
                const map2 = new DeepMap<K, V>();
                const intersectionMap = map1.intersection(map2);
                expect([...intersectionMap.entries()]).toStrictEqual([]);
            });
        });

        describe('difference method', () => {
            it('the difference of two maps contains all key-value pairs from first map not in second', async () => {
                const map1 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('2')],
                    [new K('3'), new V('3')],
                ]);
                const map2 = new DeepMap([
                    [new K('1'), new V('1')],
                    [new K('2'), new V('999')], // same key but different value -- not a match
                    [new K('4'), new V('4')],
                ]);
                const differenceMap = map1.difference(map2);
                expect([...differenceMap.entries()]).toStrictEqual([
                    [new K('2'), new V('2')],
                    [new K('3'), new V('3')],
                ]);
            });

            it('the difference of equal maps is an empty map', async () => {
                const map1 = new DeepMap([[new K('1'), new V('1')]]);
                const map2 = new DeepMap([[new K('1'), new V('1')]]);
                expect(map1.equals(map2)).toBe(true);
                const differenceMap = map1.difference(map2);
                expect([...differenceMap.entries()]).toStrictEqual([]);
            });

            it('the difference of map and an empty map is equal to the first map', async () => {
                const map1 = new DeepMap([[new K('1'), new V('1')]]);
                const map2 = new DeepMap<K, V>();
                const differenceMap = map1.difference(map2);
                expect([...differenceMap.entries()]).toStrictEqual([[new K('1'), new V('1')]]);
            });
        });
    });
});
