import * as Compile from '#compile'
import {addNode, addNodes} from '#render'
import {Array, Effect, pipe, type Schema} from 'effect'
import {
  digraph,
  toDot,
  type GraphAttributesObject,
  type RootGraphModel,
} from 'ts-graphviz'

export type GraphResult = readonly [
  errors: Compile.Error[],
  graph: RootGraphModel,
]

/**
 * Compile the given Effect/Schema object type, struct or class, and add
 * it to the given graph.
 * @param graph - The [graphviz-ts graph object](https://ts-graphviz.github.io/ts-graphviz/interfaces/_ts_graphviz_common.RootGraphModel.html).
 * @returns the updated graph or else an error message describing what went wrong.
 */
export const addObjectType =
  (graph: RootGraphModel) =>
  /** Schema `Struct` or `Class` to add to the graph. */
  <Self extends Compile.AnyClass, Fields extends Schema.Struct.Fields>(
    objectType: Compile.ObjectType<Self, Fields>,
  ): Effect.Effect<RootGraphModel, Compile.Error> =>
    pipe(objectType, Compile.objectType, Effect.flatMap(addNode(graph)))

/**
 * Compile the given Effect schemas and add any object types of `Struct` or
 * `Class` to the given graph. Returns the updated graph with nodes added, and
 * an error for each node that could not not be added.
 * @param graph - The [graphviz-ts graph object](https://ts-graphviz.github.io/ts-graphviz/interfaces/_ts_graphviz_common.RootGraphModel.html).
 * @returns A pair of graph and error list. The graph will be returned
 * unmodified only if no object types are found, or if all found failed
 * compilation, in which case an error for each given schema will be found in
 * the error list.
 */
export const addSchemas =
  (graph: RootGraphModel) =>
  /**
   * Array of `Effect/Schema` schemas. Only the object types, structs or
   * classes, will be added to the graph. Non-object types will be returned as
   * errors.
   */
  (
    schemas: Array.NonEmptyReadonlyArray<Schema.Annotable.All>,
  ): Effect.Effect<GraphResult> =>
    pipe(
      schemas,
      Compile.schemas,
      Effect.flatMap(([errors, nodes]): Effect.Effect<GraphResult> => {
        return Array.isNonEmptyArray(nodes)
          ? pipe(
              nodes,
              addNodes(graph),
              Effect.map(([renderErrors, graph]) => [
                [...errors, ...renderErrors],
                graph,
              ]),
            )
          : Effect.succeed([errors, graph])
      }),
    )

/**
 * Just like {@link addSchemas}, except all errors will be added as error nodes
 * to the graph so that it will always be modified: either because nodes were
 * successfully added or because error nodes were added.
 * @param graph - The [graphviz-ts graph object](https://ts-graphviz.github.io/ts-graphviz/interfaces/_ts_graphviz_common.RootGraphModel.html).
 * @returns The given graph but with all object types found among the given
 * schemas added as nodes if they compiled, or as errors describing why they
 * were _not_ added as nodes.
 */
export const addSchemasAndErrors =
  (graph: RootGraphModel) =>
  /**
   * Array of `Effect/Schema`. Only the object types, structs or classes, will
   * be added to the graph. Non-object types will be returned as errors.
   */
  (
    schemas: Array.NonEmptyReadonlyArray<Schema.Annotable.All>,
  ): Effect.Effect<RootGraphModel> =>
    pipe(
      schemas,
      addSchemas(graph),
      Effect.map(([errors, graph]) => {
        for (const error of errors) {
          const {name, nodeAttributes = {}} = Compile.errorAsNode(error)
          graph.node(name, nodeAttributes)
        }
        return graph
      }),
    )

/**
 * Compile the given Effect/Schema object types found among the given schemas,
 * and add them to a new graph. Errors that prevented object types from being
 * added to the graph will be added as error nodes.
 * @param name - Graph name.
 * @param graphAttributes - Optional [Graphviz graph attributes](https://graphviz.org/docs/graph).
 * @returns A new graph that where the given object types have been added as
 * nodes, or if they failed to compile, as error nodes.
 */
export const graphSchemas =
  (name: string, graphAttributes: GraphAttributesObject = {}) =>
  /** Array of `Effect/Schema` object type schemas to add to graph. */
  (
    schemas: Array.NonEmptyReadonlyArray<Schema.Annotable.All>,
  ): Effect.Effect<RootGraphModel> =>
    addSchemasAndErrors(digraph(name, graphAttributes))(schemas)

/**
 * Just like {@link graphSchemas}, except the graph is compiled into the
 * string Graphviz `.dot` syntax.
 * @param name - Graph name.
 * @param graphAttributes - Optional [Graphviz graph attributes](https://graphviz.org/docs/graph).
 * @returns The contents of a `.dot` file suitable for processing by `Graphviz` in a string.
 */
export const schemasToDot =
  (name: string, graphAttributes: GraphAttributesObject = {}) =>
  /** List of `Effect/Schema` object types, structs or classes, to add to graph. */
  <Schemas extends Array.NonEmptyReadonlyArray<Schema.Annotable.All>>(
    ...schemas: Schemas
  ): Effect.Effect<string> =>
    pipe(schemas, graphSchemas(name, graphAttributes), Effect.map(toDot))
