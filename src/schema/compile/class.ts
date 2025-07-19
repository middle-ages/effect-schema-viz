import {getAttributes} from '#annotations'
import {ClassNode, Node} from '#model'
import {Array, Data, Effect, Option, pipe, Schema, SchemaAST} from 'effect'
import {compilePropertySignatureAst} from './signature.js'

export interface AnyClass {
  new (...arg: never[]): unknown
}

export type AnyClassOf<
  Self extends InstanceType<AnyClass>,
  Fields extends Schema.Struct.Fields,
> = Schema.Class<
  Self,
  Fields,
  Schema.Struct.Encoded<Fields>,
  Schema.Struct.Context<Fields>,
  Schema.Struct.Constructor<Fields>,
  {},
  {}
>

/** Compile a schema `Class` into a diagram node or an error. */
export const compileClass = <
  Self extends InstanceType<AnyClass>,
  Fields extends Schema.Struct.Fields,
>(
  schema: AnyClassOf<Self, Fields>,
): Effect.Effect<Node, ClassError> => compileClassAst(schema.ast)

export const compileClassAst = (
  ast: SchemaAST.AST,
): Effect.Effect<Node, ClassError> =>
  pipe(
    ast,
    parseClassAst,
    Effect.map(({name, propertySignatures}) =>
      ClassNode(
        name,
        Array.map(propertySignatures, compilePropertySignatureAst),
        ...getAttributes(ast),
      ),
    ),
  )

interface Parsed {
  name: string
  propertySignatures: readonly SchemaAST.PropertySignature[]
}

const parseClassAst = (
  ast: SchemaAST.AST,
): Effect.Effect<Parsed, ClassError> => {
  // A class is a transform.
  if (!SchemaAST.isTransformation(ast)) {
    return notAClassTransform(ast)
  }

  // A class is a transform from a type literal to a declaration.
  const {from, to} = ast
  if (SchemaAST.isTypeLiteral(from) && SchemaAST.isDeclaration(to)) {
    const {propertySignatures} = from
    return pipe(
      to,
      SchemaAST.getIdentifierAnnotation,
      // A class will have an identifier in its declaration.
      Option.match({
        onNone: () => missingClassIdentifier(ast),
        onSome: name => Effect.succeed({name, propertySignatures}),
      }),
    )
  }

  return notAClassTransform(ast)
}

export const isClassAst = (
  ast: SchemaAST.AST,
): ast is SchemaAST.Transformation =>
  SchemaAST.isTransformation(ast) &&
  SchemaAST.isTypeLiteral(ast.from) &&
  SchemaAST.isDeclaration(ast.to)

export const [notAClassTransform, missingClassIdentifier] = [
  (ast: SchemaAST.AST) =>
    Effect.fail(new ClassError.NotAClassTransform({message: ast.toString()})),
  (ast: SchemaAST.AST) =>
    Effect.fail(
      new ClassError.MissingClassIdentifier({message: ast.toString()}),
    ),
]

/** An error that prevented the node from compiling. */
export namespace ClassError {
  export class NotAClassTransform extends Data.TaggedError(
    'NotAClassTransform',
  )<{
    message: string
  }> {}

  export class MissingClassIdentifier extends Data.TaggedError(
    'MissingClassIdentifier',
  )<{
    message: string
  }> {}
}

export type ClassError =
  | InstanceType<typeof ClassError.NotAClassTransform>
  | InstanceType<typeof ClassError.MissingClassIdentifier>
