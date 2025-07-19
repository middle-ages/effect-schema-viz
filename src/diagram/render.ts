import {Array, Effect, pipe, Tuple} from 'effect'
import {constant} from 'effect/Function'
import {
  digraph,
  toDot,
  type GraphAttributesObject,
  type RootGraphModel,
} from 'ts-graphviz'
import {Node} from './model.js'
import type {FormattingError} from './render/format.js'
import {addNode} from './render/node.js'

export * from './render/format.js'
export * from './render/node.js'
export * from './render/table.js'

/** Add the given nodes and their edges to the given graph. */
export const addNodes =
  /** Graph that will get the new nodes and edges. */
  (graph: RootGraphModel) =>
    /** Nodes to add. */
    (
      nodes: Array.NonEmptyArray<Node>,
    ): Effect.Effect<[FormattingError[], RootGraphModel]> =>
      pipe(
        nodes,
        Effect.partition(addNode(graph)),
        Effect.map(Tuple.mapSecond(constant(graph))),
      )

/** Create a new graph made up of the given nodes. */
export const graphNodes =
  (
    /** Graph name. */
    name: string,

    /** Graphviz graph attributes. */
    graphAttributes?: GraphAttributesObject,
  ) =>
  (nodes: Node[]): Effect.Effect<[FormattingError[], RootGraphModel]> => {
    const graph = digraph(name, graphAttributes)
    return Array.isNonEmptyArray(nodes)
      ? addNodes(graph)(nodes)
      : Effect.succeed([[], graph])
  }

/** Create a new graph from the given nodes and render it to `dot` format. */
export const renderNodes =
  (
    /** Graph name. */
    name: string,

    /** Graphviz graph attributes. */
    graphAttributes?: GraphAttributesObject,
  ) =>
  (nodes: Node[]): Effect.Effect<[FormattingError[], string]> =>
    pipe(
      nodes,
      graphNodes(name, graphAttributes),
      Effect.map(Tuple.mapSecond(toDot)),
    )
