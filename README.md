# `effect-schema-viz`

Visualize your Effect/Schema.

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [`effect-schema-viz`](#effect-schema-viz)
  - [Quick Start](#quick-start)
    - [1. Requirements](#1-requirements)
    - [2. Install](#2-install)
    - [3. Use From Code](#3-use-from-code)
  - [Examples](#examples)
  - [Features](#features)
  - [Using](#using)
    - [Importing](#importing)
    - [Graphing Object Type Schemas](#graphing-object-type-schemas)
      - [Error Handling](#error-handling)
    - [Customizing Appearance](#customizing-appearance)
      - [Labels](#labels)
  - [Limitations](#limitations)
  - [See Also](#see-also)

<!-- /code_chunk_output -->

## Quick Start

### 1. Requirements

[Effect](https://www.npmjs.com/package/effect) obviously, but you will also need the `dot` executable from [Graphviz](https://graphviz.org) in your path to generate images from `.dot` files.

For the _quick start example_ below you will also need `tsx`:

```sh
pnpm add -D tsx
```

### 2. Install

```sh
pnpm add -D effect-schema-viz
```

### 3. Use From Code

Create a script in your project source folder, for example `src/show-schema.ts`:

```ts
#!/usr/bin/env tsx

import {Schema} from 'effect'
import {schemasToDot} from 'effect-schema-viz'

class Person extends Schema.Class<Person>('Person')({
  id: Schema.Number,
  name: Schema.String,
}) {}

console.log(schemasToDot('example')(Person))
```

Run the script with:

```sh
tsx src/show-schema.ts > diagram.dot && dot -Tsvg diagram.dot > diagram.svg
```

Your SVG diagram should look like this:

![example](doc/examples/doc-example.svg)

<details><summary><b>Click here for more examples.</b></summary>

## Examples

|                Source                              |                   Diagram             |
|----------------------------------------------------|---------------------------------------|
|[struct.ts](src/test/examples/struct.ts)            |![image](doc/examples/struct.svg)      |
|[class.ts](src/test/examples/class.ts)              |![image](doc/examples/class.svg)       |
|[kitchen-sink.ts](src/test/examples/kitchen-sink.ts)|![image](doc/examples/kitchen-sink.svg)|
|[dependencies.ts](src/test/examples/dependencies.ts)|![image](doc/examples/dependencies.svg)|

</details>

## Features

1. Render your `Effect/Schema` object types, structs or classes, in Graphviz, and the relations between them as edges.
2. Customize Graphviz node attributes per node, and the Graphviz edge attributes for all _outgoing_ edges of a node.
3. Besides annotating your anonymous structs with unique identifiers, no special work required to graph your schemas. Simply send the object types you want to graph to `schemasToDot` and get back a Graphviz `.dot` file in a string.

## Using

### Importing

Everything can be imported from the single entry point `effect-schema-viz`:

```ts
import {schemasToDot} from 'effect-schema-viz'
import MyObjectTypeSchema from 'somewhere'

// Compile schema to Graphviz .dot format.
console.log(schemasToDot('MyObjectType')(MyObjectTypeSchema))
```

### Graphing Object Type Schemas

#### Error Handling

### Customizing Appearance

Besides the _identifier_ annotation used to identify anonymous structs, Graphviz node and edge attributes are also encoded in schema annotations. You can set these annotations using the functions `setNodeAttributes` and `setEdgeAttributes`.

Note Graphviz attributes are not orthogonal to each other. For example, setting the node attribute `fillcolor` will only work if the `style` attribute does not include `filled`, as [explained here](https://graphviz.org/doc/info/shapes.html#styles-for-nodes).

#### Labels

By default nodes will be configured with [Graphviz HTML labels](https://graphviz.org/doc/info/shapes.html#html). You can set your own label by setting the `label` entry on the Graphviz attributes of a node. If a node is found that already has a `label`, the label is left undisturbed.

For example to draw the object type `ClassFoo` as a `box` shape, without using the HTML label feature, we can annotate the schema:

```ts
import {setNodeAttributes} from 'effect-schema-viz'

const annotated = setNodeAttributes({
  label: 'ClassFoo',
  shape: 'box',
})(ClassFoo)
```

## Limitations

1. Without parsing the source, `effect-schema-viz` cannot know the _names_ of your `Structs`. To get useful diagrams, you should annotate your structs with the identifier annotation, using one of:
    1. `Effect/Schema` [identifier annotation](https://github.com/Effect-TS/effect/blob/main/packages/effect/src/SchemaAST.ts#L109)
    2. Create your structs using [Struct.named(name)({...})](https://github.com/middle-ages/haag59-monorepo/blob/main/packages/effect-schema-viz/src/schema/annotations.ts#L76).
    3. Call the function [setIdentifier](https://github.com/middle-ages/haag59-monorepo/blob/main/packages/effect-schema-viz/src/schema/annotations.ts#L44) on the `Struct`.
    4. Use _classes_ instead of _structs_. Classes are identifiable with no extra work. You can also _wrap_ you structs with classes.
2. No support yet for relations other than _has a_.
3. No support yet for _Records_ or _index signatures_.
4. Nothing is written yet on the _edges_.
5. No support yet for _custom declarations_.

## See Also

1. [API Documentation](https://middle-ages.github.io/effect-schema-viz-docs).
2. [`src/diagram`](src/diagram) package [type diagram](https://raw.githubusercontent.com/middle-ages/haag59-monorepo/refs/heads/main/packages/effect-schema-viz/src/diagram/doc/effect-schema-viz-diagram-model.png).
3. [graphviz-ts](https://github.com/ts-graphviz/ts-graphviz).
4. [Effect/Schema](https://effect.website/docs/schema/introduction).
