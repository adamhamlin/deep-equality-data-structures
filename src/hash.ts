import hash, { NormalOption as ObjectHashOptions } from 'object-hash';

/**
 * Hashing options
 */
export type HashOptions = ObjectHashOptions & {
    /**
     * If true, objects will be JSON-serialized/deserialized into "plain" objects prior to hashing.
     */
    jsonSerializableOnly?: boolean;
};

/**
 * Get hash string for the given object according to specified options
 * @param obj the object to hash
 * @param options the hashing options
 * @returns the resultant hash string
 */
export function getHashStr<T extends object>(obj: T, options: HashOptions = {}): string {
    const { jsonSerializableOnly, ...objectHashOptions } = options;
    // Default hash algorithm to MD5, since this is not a cryptographic hash
    if (objectHashOptions.algorithm === undefined) {
        objectHashOptions.algorithm = 'md5';
    }

    const objToHash = jsonSerializableOnly ? convertToPlainObject(obj) : obj;
    return hash(objToHash, objectHashOptions);
}

function convertToPlainObject<T extends object>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}
