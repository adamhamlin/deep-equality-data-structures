/**
 * Dummy test object
 */
export class TestObject {
    constructor(public a: string, public b: RegExp, public c: TestObjectField) {}
}

/**
 * Another dummy test object
 */
export class TestObjectField {
    constructor(public someField: string) {}
}
