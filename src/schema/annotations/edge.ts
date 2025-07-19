import type {AllSchema} from '#util'
import {Option} from 'effect'
import {getAnnotation, type AST} from 'effect/SchemaAST'
import type {EdgeAttributesObject} from 'ts-graphviz'

/** Annotates nodes with edge attributes for their _outgoing_ edges. */
export const EdgeAttributes = Symbol.for('effect-schema-viz/edge-attributes')

declare module 'effect/Schema' {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [EdgeAttributes]?: EdgeAttributesObject
    }
  }
}

/**
 * Set Graphviz [edge attributes](https://graphviz.org/docs/edges/) for all
 * edges _outgoing_ from the node annotated.
 */
export const setEdgeAttributes =
  (attributes: EdgeAttributesObject) =>
  <Schema extends AllSchema>(schema: Schema) =>
    schema.annotations({[EdgeAttributes]: attributes}) as typeof schema

/**
 * Get Graphviz [edge attributes](https://graphviz.org/docs/edges/) used for all
 * edges _outgoing_ from the node annotated.
 */
export const getEdgeAttributes: (
  ast: AST,
) => Option.Option<EdgeAttributesObject> =
  getAnnotation<EdgeAttributesObject>(EdgeAttributes)
