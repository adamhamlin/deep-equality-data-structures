export type TransformFunction<T> = (input: T) => unknown;

export class Transformers {
    static identity<T>(input: T): T {
        return input;
    }

    static jsonSerializeDeserialize<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }
}
