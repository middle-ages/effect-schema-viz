import {Option, Schema} from 'effect'
import {constant, flow, pipe} from 'effect/Function'
import {
  getIdentifierAnnotation,
  type AST,
  type TypeLiteral,
} from 'effect/SchemaAST'
import type {
  EdgeAttributesObject,
  GraphAttributesObject,
  NodeAttributesObject,
} from 'ts-graphviz'
import {type AllSchema, fanout} from '#util'
import {getEdgeAttributes, setEdgeAttributes} from './annotations/edge.js'
import {getNodeAttributes, setNodeAttributes} from './annotations/node.js'

export * from './annotations/edge.js'
export * from './annotations/node.js'

/**
 * Extract a display and a target from the annotations of a type literal.
 *
 * If it is has an identifier annotation, we deduce this is a named type and
 * return its name as both the display name and the target.
 *
 * If not, we return the serialized AST as a display and no target.
 */
export const getIdentifierOrSerialize: (
  ast: TypeLiteral,
) => [display: string, targets: readonly string[]] = ast =>
  pipe(
    ast,
    getIdentifierAnnotation,
    Option.map<string, [string, string[]]>(id => [id, [id]]),
    Option.getOrElse<[string, string[]]>(() => [ast.toString(), []]),
  )

export const getIdentifierOrAnonymous: (ast: TypeLiteral) => string = flow(
  getIdentifierAnnotation,
  Option.getOrElse(constant('Anonymous')),
)

/**
 * Annotate the given `Schema.Struct` with the given identifier.
 * @param identifier - unique string ID.
 * @returns same schema as given, except now annotated.
 */
export const setIdentifier =
  (identifier: string) =>
  <Fields extends Schema.Struct.Fields>(
    /** The schema to annotate. */
    schema: Schema.Struct<Fields>,
  ): typeof schema =>
    schema.annotations({identifier})

/**
 * Extract the Graphviz node and edge attributes from given AST annotations.
 */
export const getAttributes: (
  ast: AST,
) => readonly [NodeAttributesObject, EdgeAttributesObject] = fanout(
  flow(
    getNodeAttributes,
    Option.getOrElse(() => ({}) as NodeAttributesObject),
  ),
  flow(
    getEdgeAttributes,
    Option.getOrElse(() => ({}) as EdgeAttributesObject),
  ),
)

/** Set Graphviz node and edge attribute annotations on the given AST. */
export const setAttributes =
  (
    nodeAttributes: NodeAttributesObject,
    edgeAttributes: GraphAttributesObject = {},
  ) =>
  <Schema extends AllSchema>(schema: Schema): typeof schema =>
    pipe(
      schema,
      setNodeAttributes(nodeAttributes),
      setEdgeAttributes(edgeAttributes),
    )

/**
 * Just like [Effect/Schema/Struct](https://effect.website/docs/schema/basic-usage/#structs)
 * except has two extra functions under the `named` and `styled` keys. These are
 * syntax sugar for creating a struct and adding the identifier and Graphviz
 * attributes manually.
 *
 * 1. `named` - takes as an extra 1st parameter the name of the object type.
 * 1. `styles` - takes as an extra 1st parameter the name of the object type, and optional parameters for node and edge GraphViz attributes.
 */
export const Struct = Object.assign(Schema.Struct, {
  named:
    (identifier: string) =>
    <Fields extends Schema.Struct.Fields>(
      fields: Fields,
    ): Schema.Struct<Fields> =>
      setIdentifier(identifier)(Schema.Struct(fields)),

  styled:
    (
      identifier: string,
      nodeAttributes: NodeAttributesObject,
      edgeAttributes: EdgeAttributesObject = {},
    ) =>
    <Fields extends Schema.Struct.Fields>(fields: Fields) =>
      pipe(
        Schema.Struct(fields),
        setIdentifier(identifier),
        setAttributes(nodeAttributes, edgeAttributes),
      ),
})
