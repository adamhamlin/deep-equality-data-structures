export type TransformFunction<T, R> = (input: T) => R;

export class Transformers {
    static identity<T, R = T>(input: T): R {
        // Just make the types happy :)
        return input as unknown as R;
    }

    static jsonSerializeDeserialize<T, R = T>(obj: T): R {
        return JSON.parse(JSON.stringify(obj));
    }
}
