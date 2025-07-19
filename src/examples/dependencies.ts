#!/usr/bin/env tsx

import {type Pair} from '#util'
import {Effect, Array, pipe, Schema} from 'effect'
import {schemasToDot, Struct} from 'effect-schema-viz'
import type {
  EdgeAttributesObject,
  GraphAttributesObject,
  NodeAttributesObject,
} from 'ts-graphviz'

const graphStyle = {
  bgcolor: 'gray90',
  rankdir: 'LR',
  pad: 1 / 4,
  splines: 'ortho',
} as const satisfies GraphAttributesObject

const nodeStyle = {
  shape: 'plaintext',
  fontname: 'Inter',
  fontcolor: 'gray10',
  fillcolor: 'white',
  color: 'grey75',
  style: 'filled',
  margin: 1 / 24,
} as const satisfies NodeAttributesObject

const edgeStyle = {
  color: 'gray25',
  arrowhead: 'vee',
  arrowsize: 0.5,
} as const satisfies EdgeAttributesObject

const dot = await Effect.runPromise(
  schemasToDot('dependency tree example', graphStyle)(...buildStructs()),
)

console.log(dot)

function buildStructs(): Array.NonEmptyReadonlyArray<Schema.Annotable.All> {
  const leafList = buildLeaves()
  const branches = buildBranches(leafList)
  const root = buildRoot(branches)
  return [...Array.flatten(leafList), ...branches, root]
}

function buildRoot<Fields extends Schema.Struct.Fields>(
  branches: Pair<Schema.Struct<Fields>>,
) {
  return struct('Root')('_0', () => ({branches: Schema.Tuple(...branches)}))
}

function buildBranches<Fields extends Schema.Struct.Fields>([
  first,
  second,
]: Pair<Pair<Schema.Struct<Fields>>>) {
  return [buildBranch('_1', first), buildBranch('_2', second)] as const
}

function buildLeaves() {
  return [
    [buildLeaf('_1'), buildLeaf('_2')],
    [buildLeaf('_3'), buildLeaf('_4')],
  ] as const
}

function buildBranch<Fields extends Schema.Struct.Fields>(
  suffix: string,
  leaves: Pair<Schema.Struct<Fields>>,
) {
  return struct('Branch')(suffix, () => ({
    leaves: Schema.Tuple(...leaves),
  }))
}

function buildLeaf(suffix: string) {
  return struct('Leaf')(suffix, name => ({value: Schema.Literal(name)}))
}

function struct(prefix: string) {
  return <Fields extends Schema.Struct.Fields>(
    suffix: string,
    signatures: (name: string) => Fields,
  ): Schema.Struct<Fields> => {
    const identifier = prefix + suffix
    return pipe(
      identifier,
      signatures,
      Struct.styled(identifier, nodeStyle, edgeStyle),
    )
  }
}
