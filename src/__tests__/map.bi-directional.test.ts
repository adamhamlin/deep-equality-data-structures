import { BiDirectionalDeepMap } from '../map.bi-directional';

describe('BiDirectionalDeepMap', () => {
    describe('Overridden DeepMap API', () => {
        describe('#constructor', () => {
            it('no entries argument', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>();
                expect(map.size).toBe(0);
                expect(map['valueMap'].size).toBe(0);
                expect([...map.entries()]).toStrictEqual([]);
            });

            it('with entries argument', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>([
                    [/1st/, /first/g],
                    [/2nd/, /second/g],
                ]);
                expect(map.size).toBe(2);
                expect(map['valueMap'].size).toBe(2);
                expect([...map.entries()]).toStrictEqual([
                    [/1st/, /first/g],
                    [/2nd/, /second/g],
                ]);
            });
        });

        describe('#set', () => {
            it('successfully add key-value pair', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>();
                map.set(/1st/, /first/g);
                expect(map.size).toBe(1);
                expect(map['valueMap'].size).toBe(1);
                expect([...map.entries()]).toStrictEqual([[/1st/, /first/g]]);
                expect(map.has(/1st/)).toBe(true);
                expect(map.get(/1st/)).toStrictEqual(/first/g);
            });

            it('error when attempting to set key-value pair whose value is already associated with different key', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>();
                map.set(/1st/, /first/g);
                map.set(/1st/, /first/g); // no issue when overwriting same key + value
                expect(() => map.set(/2nd/, /first/g)).toThrow(
                    `Could not set key='/2nd/': The value='/first/g' is already associated with key='/1st/'`
                );
            });
        });

        describe('#delete', () => {
            it('returns false when key not found in map', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>();
                expect(map.delete(/1st/)).toBe(false);
            });

            it('returns true when successfully deleting a key-value pair', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>();
                map.set(/1st/, /first/g);
                expect(map.delete(/1st/)).toBe(true);
                expect(map.size).toBe(0);
                expect(map['valueMap'].size).toBe(0);
            });
        });

        describe('#clear', () => {
            it('clears entries from all internal maps', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>();
                map.set(/1st/, /first/g);
                map.set(/2nd/, /second/g);
                expect(map.size).toBe(2);
                expect(map['valueMap'].size).toBe(2);
                map.clear();
                expect(map.size).toBe(0);
                expect(map['valueMap'].size).toBe(0);
            });
        });
    });

    describe('BiDirectionalDeepMap API', () => {
        describe('#hasValue', () => {
            it('returns true when given value is present in the map', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>([[/1st/, /first/g]]);
                expect(map.hasValue(/first/g)).toBe(true);
            });

            it('returns false when given value is not present in the map', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>([[/1st/, /first/g]]);
                expect(map.hasValue(/second/g)).toBe(false);
            });
        });

        describe('#getKeyByValue', () => {
            it('returns the associated key when given value is present in the map', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>([[/1st/, /first/g]]);
                expect(map.getKeyByValue(/first/g)).toStrictEqual(/1st/);
            });

            it('returns undefined when given value is not present in the map', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>([[/1st/, /first/g]]);
                expect(map.getKeyByValue(/second/g)).toBeUndefined();
            });
        });

        describe('#deleteByValue', () => {
            it('removes key-value pair and returns true when given value present in map', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>([[/1st/, /first/g]]);
                expect(map.deleteByValue(/first/g)).toBe(true);
                expect(map.size).toBe(0);
                expect(map['valueMap'].size).toBe(0);
            });

            it('returns false when given value not present in map', async () => {
                const map = new BiDirectionalDeepMap<RegExp, RegExp>([[/1st/, /first/g]]);
                expect(map.deleteByValue(/second/g)).toBe(false);
                // No side effects
                expect(map.size).toBe(1);
                expect(map['valueMap'].size).toBe(1);
            });
        });
    });
});
