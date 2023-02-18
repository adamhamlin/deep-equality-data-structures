# Deep Equality Javascript Data Structures

[![npm version](https://badge.fury.io/js/deep-equality-data-structures.svg)](https://badge.fury.io/js/deep-equality-data-structures)
[![CI Status Badge](https://github.com/adamhamlin/deep-equality-data-structures/actions/workflows/ci.yaml/badge.svg)](https://github.com/adamhamlin/deep-equality-data-structures/actions/workflows/ci.yaml)

A drop-in replacement for ES native `Map` and `Set` with deep equality support for objects.

## Install

```bash
npm install deep-equality-data-structures
```

## Why?

ES `Map` and `Set` only support referential equality:

```typescript
interface MyType {
    a: number;
}
const set = new Set<MyType>();
set.add({ a: 1 });
set.add({ a: 1 });
set.size; // 2
```

Now, using deep equality:

```typescript
import { DeepSet } from 'deep-equality-data-structures';

interface MyType {
    a: number;
}
const set = new DeepSet<MyType>();
set.add({ a: 1 });
set.add({ a: 1 });
set.size; // 1
```

## How?

This project relies on the [object-hash](https://github.com/puleos/object-hash) library to normalize object types to unique strings.

## Comparable Interface

The following supplemental comparisons/methods are included:

-   `equals`
-   `contains`
-   `union`
-   `intersection`
-   `difference`

```typescript
// COMPARISONS
const set1 = new DeepSet([{ a: 1 }, { b: 2 }]);
const set2 = new DeepSet([{ a: 1 }, { b: 2 }]);
set1.equals(set2); // true

const set3 = new DeepSet([{ a: 1 }]);
set1.equals(set3); // false
set1.contains(set3); // true

// SET OPERATIONS (available for maps, too)
const set3 = new DeepSet([{ a: 1 }, { b: 2 }]);
const set4 = new DeepSet([{ b: 2 }, { c: 3 }]);
set3.union(set4); // DeepSet([{ a: 1 }, { b: 2 }, { c: 3 }])
set3.intersection(set4); // DeepSet([{ b: 2 }])
set3.difference(set4); // DeepSet([{ a: 1 }])
```

## Configuration Options

The default settings should be suitable for most use cases, but behavior can be configured.

```typescript
new DeepSet<V>(values?, options?)
new DeepMap<K,V>(entries?, options?)
```

The `options` argument is a superset of the options defined for [object-hash](https://github.com/puleos/object-hash#hashvalue-options), with the same defaults (exception: the default algoritm is `md5`). There are also library-specific options.

### Library-specific options:

-   `transformer` - a custom function that transforms Map keys/Set values prior to hashing. It does not affect the values that are stored.

    ```typescript
    type MyType = { val: number; other: number };
    const a: MyType = { val: 1, other: 1 };
    const b: MyType = { val: 1, other: 2 };
    const transformer = (obj: MyType) => ({ val: obj.val });

    const set = new DeepSet([a, b]);
    set.size; // 2
    const set = new DeepSet([a, b], { transformer });
    set.size; // 1

    [...set.values()]; // [{ val: 1, other: 2 }]
    ```

-   `mapValueTransformer` - a custom function that transforms Map values prior to hashing. This is only relevant to the `.equals` and `.contains` operations from the `Comparable` interface. It does not affect the values that are stored.

    ```typescript
    type MyType = { val: number; other: number };
    const a: MyType = { val: 1, other: 1 };
    const b: MyType = { val: 1, other: 2 };
    const mapValueTransformer = (obj: MyType) => ({ val: obj.val });

    const map1 = new DeepMap([[1, a]]);
    const map2 = new DeepMap([[1, b]]);
    map1.equals(map2); // false

    const map1 = new DeepMap([[1, a]], { mapValueTransformer });
    const map2 = new DeepMap([[1, b]], { mapValueTransformer });
    map1.equals(map2); // true

    [...map1.entries()]; // [[1, { val: 1, other: 1 }]]
    [...map2.entries()]; // [[1, { val: 1, other: 2 }]]
    ```

-   `useToJsonTransform` - if true, only use JSON-serializable properties when computing hashes, equality, etc. (default: false)

    > _NOTE: This setting overrides both `transformer` and `mapValueTransformer`_

    ```typescript
    class A {
        constructor(public x: number) {}
    }
    class B {
        constructor(public x: number) {}
    }
    const a = new A(45);
    const b = new B(45);

    const set = new DeepSet([a, b]);
    set.size; // 2
    const set = new DeepSet([a, b], { useToJsonTransform: true });
    set.size; // 1
    ```

## Notes/Caveats

-   This still supports primitive keys/values like traditional `Map`/`Set`.
-   Don't mutate objects stored in the data structure. The internal representation is not affected by this mutation, so behavior may be unexpected.
-   Don't mutate objects in the user-supplied `transformer` or `mapValueTransformer` functions. It will affect the stored version.
-   This implementation does not explicitly "handle" key collisions. However, with the default algorithm (MD5), even if a map contained one TRILLION entries, the probability of a collision on the next insert is only 0.000000000000001. If you need better odds, use SHA1, SHA256, etc.

## CI/CD

Using Github Actions, the CI build will run on all pull requests and pushes/merges to main.

This project uses [Conventional Commits](https://www.conventionalcommits.org/) and [standard-version](https://github.com/conventional-changelog/standard-version) to facilitate versioning and changelogs.
