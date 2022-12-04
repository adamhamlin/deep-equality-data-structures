# Deep Equality Javascript Data Structures

[![CI Status Badge](https://github.com/adamhamlin/deep-equality-data-structures/actions/workflows/ci.yaml/badge.svg)](https://github.com/adamhamlin/deep-equality-data-structures/actions/workflows/ci.yaml)

A drop-in replacement for ES native `Map` and `Set` with deep equality support for objects.

## Why?

ES `Map` and `Set` only support referential equality:

```typescript
interface MyObject {
    a: number;
}
const set = new Set<MyObject>();
set.add({ a: 1 });
set.add({ a: 1 });
set.size; // 2
```

Now, using deep equality:

```typescript
import { DeepSet } from '@adamhamlin/deep-equality-data-strucures';

interface MyObject {
    a: number;
}
const set = new DeepSet<MyObject>();
set.add({ a: 1 });
set.add({ a: 1 });
set.size; // 1
```

## How?

This project relies on the [object-hash](https://github.com/puleos/object-hash) library to map object types to strings.

## Comparable Interface

Equality and subset comparisons are supported:

```typescript
const set1 = new DeepSet([{ a: 1 }, { b: 2 }]);
const set2 = new DeepSet([{ a: 1 }, { b: 2 }]);
set1.equals(set2); // true

const set3 = new DeepSet([{ a: 1 }]);
set1.equals(set3); // false
set1.contains(set3); // true
```

## Configuration Options

```typescript
new DeepSet(values?, options?)
new DeepMap(entries?, options?)
```

The `options` argument is a superset of the options defined for [object-hash](https://github.com/puleos/object-hash#hashvalue-options), with the same defaults (exception: the default algoritm is `md5`).

Additional project-specific options:

-   `jsonSerializableOnly` - if true, only use JSON-serializable properties when computing hashes, equality, etc. (default: false)

    ```typescript
    class A {
        constructor(public x: number) {}
    }
    class B {
        constructor(public x: number) {}
    }
    const b = new B(45);
    const c = new C(45);

    const set = new DeepSet([b, c]);
    set.size; // 2
    const set = new DeepSet([b, c], { jsonSerializableOnly: true });
    set.size; // 1
    ```

## Notes/Caveats

-   Don't mutate a map key (or set value) while still using the data structure. The internal representation is not affected by this mutation, so behavior may be unexpected.
-   This implementation does not explicitly "handle" key collisions. However, with the default algorithm (MD5), even if a map contained one TRILLION entries, the probability of a collision on the next insert is only 0.000000000000001. If you need better odds, use SHA1, SHA256, etc.

## CI/CD

Using Github Actions, the CI build will run on all pull requests and pushes/merges to main.

This project uses [Conventional Commits](https://www.conventionalcommits.org/) and [standard-version](https://github.com/conventional-changelog/standard-version) to facilitate versioning and changelogs.
