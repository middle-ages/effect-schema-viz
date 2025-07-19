import {
  compileObjectType,
  CompileResult,
  compileSchemas,
  type AnyClass,
  type ObjectType,
} from '#compile'
import {addNode, addNodes} from '#render'
import {Array, Either, pipe, Tuple, type Schema} from 'effect'
import {
  digraph,
  toDot,
  type GraphAttributesObject,
  type RootGraphModel,
} from 'ts-graphviz'
import type {AllSchema} from '#util'

/**
 * Compile the given Effect/Schema object type, struct or class, and add
 * it to the given graph.
 * @param graph - The [graphviz-ts graph object](https://ts-graphviz.github.io/ts-graphviz/interfaces/_ts_graphviz_common.RootGraphModel.html).
 * @returns the updated graph or else an error message describing what went wrong.
 */
export const addObjectType =
  (graph: RootGraphModel) =>
  /** Schema `Struct` or `Class` to add to the graph. */
  <Self extends AnyClass, Fields extends Schema.Struct.Fields>(
    objectType: ObjectType<Self, Fields>,
  ): Either.Either<RootGraphModel, CompileResult.Error> =>
    pipe(objectType, compileObjectType, Either.map(addNode(graph)))

/**
 * Compile the given Effect schemas and add any object types of `Struct` or
 * `Class` to the given graph. Schemas that are not object types will be
 * silently ignored as long as at least a single object type schema is found.
 *
 * If no object types are found among the given schemas then an error is returned.
 *
 * Object types that fail to compile into graph nodes, for example
 * _structs with no identifier_, will not be added to the graph. They will be
 * found instead as errors in the return value, one for each node that failed
 * compilation, together with the graph where nodes that _did_ compile were
 * added.
 *
 * @param graph - The [graphviz-ts graph object](https://ts-graphviz.github.io/ts-graphviz/interfaces/_ts_graphviz_common.RootGraphModel.html).
 * @returns A pair of graph and error list. The graph will have any object types
 * found amount the given schemas added as nodes, if they compiled. Object types
 * that failed compilation will appear as errors in the `errors` member. If no
 * object types were found, a single error will be found in the `errors` array,
 * of the type {@link NoObjectTypesFound}. The graph will be returned unmodified
 * only if no object types are found, or if all found failed compilation, in
 * which case each should appear as an error under the `errors` key.
 */
export const addSchemas =
  (graph: RootGraphModel) =>
  /**
   * Array of `Effect/Schema` schemas. Only the object types, structs or
   * classes, will be added to the graph. Non-object types will be ignored as
   * long as there is at least a single object type schema found.
   */
  (
    schemas: Array.NonEmptyReadonlyArray<AllSchema>,
  ): readonly [
    graph: RootGraphModel,
    errors: readonly CompileResult.Error[],
  ] => {
    const results = compileSchemas(schemas)
    return CompileResult.isNoObjectTypesFoundResult(results)
      ? ([graph, [results]] as const)
      : pipe(results, CompileResult.partition, Tuple.mapFirst(addNodes(graph)))
  }

/**
 * Just like {@link addSchemas}, except all errors, including
 * {@link NoObjectTypesFound}, will be added as error nodes to the graph so that
 * it will always be modified: either because nodes were successfully added or
 * because error nodes were added.
 *
 * @param graph - The [graphviz-ts graph object](https://ts-graphviz.github.io/ts-graphviz/interfaces/_ts_graphviz_common.RootGraphModel.html).
 * @returns The given graph but with all object types found among the given
 * schemas added as nodes if they compiled, or as errors describing why they
 * were _not_ added as nodes. If no object types were given a single error node
 * labeled `no object types found` will be added to the graph.
 *
 */
export const addSchemasAndErrors =
  (graph: RootGraphModel) =>
  /**
   * Array of `Effect/Schema`. Only the object types, structs or classes, will
   * be added to the graph. Non-object types will be ignored as long as there is
   * at least a single object type node found.
   */
  (schemas: Array.NonEmptyReadonlyArray<AllSchema>): RootGraphModel => {
    const [graphWithNodes, errors] = addSchemas(graph)(schemas)
    return pipe(
      errors,
      Array.map(CompileResult.asNode),
      addNodes(graphWithNodes),
    )
  }

/**
 * Compile the given Effect/Schema object types found among the given schemas,
 * ignoring all others types, and add them to a new graph. Errors that prevented
 * object types from being added to the graph will be added as error nodes.
 * @param name - Graph name.
 * @param options - Optional [Graphviz graph attributes](https://graphviz.org/docs/graph).
 * @returns A new graph that where the given object types have been added as
 * nodes, or if they failed to compile, as error nodes. If no object types were
 * found among the given schemas, a single error node, `no object types found`,
 * will be added to the graph.
 */
export const graphSchemas =
  (name: string, options: GraphAttributesObject = {}) =>
  /** Array of `Effect/Schema` object type schemas to add to graph. */
  (schemas: Array.NonEmptyReadonlyArray<AllSchema>): RootGraphModel =>
    addSchemasAndErrors(digraph(name, options))(schemas)

/**
 * Just like {@link graphObjectTypes}, except the graph is compiled into the
 * string Graphviz `.dot` syntax.
 * @param name - Graph name.
 * @param options - Optional [Graphviz graph attributes](https://graphviz.org/docs/graph).
 * @returns The contents of a `.dot` file suitable for processing by `Graphviz` in a string.
 */
export const schemasToDot =
  (name: string, options: GraphAttributesObject = {}) =>
  /** List of `Effect/Schema` object types, structs or classes, to add to graph. */
  <Schemas extends Array.NonEmptyReadonlyArray<AllSchema>>(
    ...schemas: Schemas
  ): string =>
    pipe(schemas, graphSchemas(name, options), toDot)
