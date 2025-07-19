#!/usr/bin/env tsx

import {Array, pipe, Schema} from 'effect'
import {schemasToDot, Struct} from 'effect-schema-viz'
import type {
  EdgeAttributesObject,
  GraphAttributesObject,
  NodeAttributesObject,
} from 'ts-graphviz'
import {type Pair, type AllSchema} from '#util'

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

const dot = schemasToDot(
  'dependency tree example',
  graphStyle,
)(...buildStructs())

console.log(dot)

function buildStructs(): Array.NonEmptyReadonlyArray<AllSchema> {
  const leafList = buildLeaves()
  const branches = buildBranches(leafList)
  const root = buildRoot(branches)
  return [...Array.flatten(leafList), ...branches, root]
}

function buildRoot<Fields extends Schema.Struct.Fields>(
  branches: Pair<Schema.Struct<Fields>>,
) {
  return struct('Root')('₀', () => ({branches: Schema.Tuple(...branches)}))
}

function buildBranches<Fields extends Schema.Struct.Fields>([
  first,
  second,
]: Pair<Pair<Schema.Struct<Fields>>>) {
  return [buildBranch('₁', first), buildBranch('₂', second)] as const
}

function buildLeaves() {
  return [
    [buildLeaf('₁'), buildLeaf('₂')],
    [buildLeaf('₃'), buildLeaf('₄')],
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
