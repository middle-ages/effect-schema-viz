import {Array, Option, pipe, Schema, SchemaAST} from 'effect'
import type {Predicate} from 'effect/Predicate'
import type {AllSchema} from '#util'
import {
  compileClassAst,
  isClassAst,
  type AnyClass,
  type AnyClassOf,
} from './compile/class.js'
import * as CompileResult from './compile/result.js'
import {compileStructAst, isStructAst} from './compile/struct.js'

export * from './compile/class.js'
export * as CompileResult from './compile/result.js'
export * from './compile/struct.js'

export type ObjectType<
  Self extends AnyClass,
  Fields extends Schema.Struct.Fields,
> = Schema.Struct<Fields> | AnyClassOf<Self, Fields>

export type AnyObjectType<Key extends PropertyKey> = ObjectType<
  any,
  Record<Key, AllSchema>
>

/**
 * Compile a schema object type, `Struct` or `Class`, into a diagram node or an
 * error.
 */
export const compileObjectType = <
  Self extends AnyClass,
  Fields extends Schema.Struct.Fields,
>({
  ast,
}: ObjectType<Self, Fields>): CompileResult.Result =>
  isStructAst(ast) ? compileStructAst(ast) : compileClassAst(ast)

/**
 * Compile a schema into an option of a diagram node or an error. If the schema
 * is not an object type, I.E: a `Struct` or `Class`, returns `none`.
 */
export const compileSchema = (
  schema: AllSchema,
): Option.Option<CompileResult.Result> =>
  pipe(
    schema.ast,
    Option.liftPredicate(isObjectTypeAst),
    Option.map(ast =>
      (isStructAst(ast) ? compileStructAst : compileClassAst)(ast),
    ),
  )

/**
 * Compile a non-empty array of mixed classes and named structs into diagram
 * nodes or a list of errors. Schemas that are not classes or structs are
 * ignored.
 * @param schemas - Non-empty mixed array of schema structs and/or schema
 * classes.
 * @returns Either a combined non-empty list of errors, a non-empty list of
 * nodes, or both if some nodes did compile and others did not. If no object
 * types were found in the given schemas, then a single `No object types found.`
 * error is returned.
 */
export const compileSchemas: (
  schemas: Array.NonEmptyReadonlyArray<AllSchema>,
) => CompileResult.Results = schemas => {
  const found = pipe(schemas, Array.map(compileSchema), Array.getSomes)
  return Array.isNonEmptyReadonlyArray(found)
    ? CompileResult.combine(found)
    : CompileResult.noObjectTypesFound(schemas[0].ast)
}

/** True if the AST node can be compiled into a Graphviz node. */
export const isObjectTypeAst: Predicate<SchemaAST.AST> = ast =>
  isStructAst(ast) || isClassAst(ast)
