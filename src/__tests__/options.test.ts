import { getOptionsWithDefaults } from '../options';
import { Transformers } from '../transformers';

describe('options.ts', () => {
    describe('getOptionsWithDefaults', () => {
        it('baseline/default values', async () => {
            expect(getOptionsWithDefaults({})).toStrictEqual({
                algorithm: 'md5',
                transformer: Transformers.identity,
                mapValueTransformer: Transformers.identity,
                useToJsonTransform: false,
            });
        });

        it('specified values override default values', async () => {
            expect(
                getOptionsWithDefaults({
                    algorithm: 'sha1',
                    useToJsonTransform: true,
                })
            ).toStrictEqual({
                algorithm: 'sha1',
                transformer: Transformers.identity,
                mapValueTransformer: Transformers.identity,
                useToJsonTransform: true,
            });
        });
    });
});
