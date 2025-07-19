import type {Node} from '#model'
import {pluck} from '#util'
import {Array, Effect, flow, Schema, SchemaAST} from 'effect'
import type {Predicate} from 'effect/Predicate'
import {
  compileClassAst,
  isClassAst,
  type AnyClass,
  type AnyClassOf,
} from './compile/class.js'
import {type Error, notAnObjectType} from './compile/error.js'
import {compileStructAst} from './compile/struct.js'

export * from './compile/class.js'
export * from './compile/error.js'
export * from './compile/struct.js'

export type Result = Effect.Effect<Node, Error>
export type Results = [excluded: Error[], satisfying: Node[]]

export type ObjectType<
  Self extends AnyClass,
  Fields extends Schema.Struct.Fields,
> = Schema.Struct<Fields> | AnyClassOf<Self, Fields>

export type AnyObjectType<Key extends PropertyKey> = ObjectType<
  any,
  Record<Key, Schema.Annotable.All>
>

/**
 * Compile an AST into an option of a  node or an error. If the AST is not of an
 * object type, I.E: it is not either a `Struct` or `Class`, returns an error.
 */
export const objectTypeAst = (ast: SchemaAST.AST): Result =>
  SchemaAST.isTypeLiteral(ast)
    ? compileStructAst(ast)
    : SchemaAST.isTransformation(ast)
      ? compileClassAst(ast)
      : Effect.fail(notAnObjectType(ast))

/**
 * Compile a schema object type, `Struct` or `Class`, into a diagram node or an
 * error.
 */
export const objectType = <
  Self extends AnyClass,
  Fields extends Schema.Struct.Fields,
>({
  ast,
}: ObjectType<Self, Fields>): Result =>
  SchemaAST.isTypeLiteral(ast) ? compileStructAst(ast) : compileClassAst(ast)

/**
 * Compile a non-empty array of mixed classes and named structs into diagram
 * nodes and/or a list of errors. Schemas that are not classes or structs are
 * returned as errors.
 * @param schemas - Non-empty mixed array of schema structs and/or schema
 * classes.
 * @returns A list of compiled nodes and a list of errors. For every schema
 * given there should appear in the results either a node or an error.
 */
export const schemas: (
  /** Non empty array of object type schemas to compile. */
  schemas: Array.NonEmptyReadonlyArray<Schema.Annotable.All>,
) => Effect.Effect<Results> = flow(
  Array.map(pluck('ast')),
  Effect.partition(objectTypeAst),
)

/** True if the AST node can be compiled into a Graphviz node. */
export const isObjectTypeAst: Predicate<SchemaAST.AST> = ast =>
  SchemaAST.isTypeLiteral(ast) || isClassAst(ast)
