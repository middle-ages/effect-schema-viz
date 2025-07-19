import {getAttributes} from '#annotations'
import {ClassNode, Node} from '#model'
import {Array, Data, Either, Option, pipe, Schema, SchemaAST} from 'effect'
import {compilePropertySignatureAst} from './signature.js'

export interface AnyClass {
  new (...arg: never[]): unknown
}

export type AnyClassOf<
  Self extends AnyClass,
  Fields extends Schema.Struct.Fields,
> = Schema.Class<
  InstanceType<Self>,
  Fields,
  Schema.Struct.Encoded<Fields>,
  Schema.Struct.Context<Fields>,
  Schema.Struct.Constructor<Fields>,
  {},
  {}
>

/** Compile a schema `Class` into a diagram node or an error. */
export const compileClass = <
  Self extends AnyClass,
  Fields extends Schema.Struct.Fields,
>(
  schema: AnyClassOf<Self, Fields>,
): Either.Either<Node, ClassError> => compileClassAst(schema.ast)

export const compileClassAst: (
  ast: SchemaAST.AST,
) => Either.Either<Node, ClassError> = ast =>
  pipe(
    ast,
    parseClassAst,
    Either.map(({name, propertySignatures}) =>
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
): Either.Either<Parsed, ClassError> => {
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
        onSome: name => Either.right({name, propertySignatures}),
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
  (ast: SchemaAST.AST) => Either.left(new ClassError.NotAClassTransform({ast})),
  (ast: SchemaAST.AST) =>
    Either.left(new ClassError.MissingClassIdentifier({ast})),
]

/** An error that prevented the node from compiling. */
export namespace ClassError {
  export class NotAClassTransform extends Data.TaggedError(
    'NotAClassTransform',
  )<{
    ast: SchemaAST.AST
  }> {}

  export class MissingClassIdentifier extends Data.TaggedError(
    'MissingClassIdentifier',
  )<{
    ast: SchemaAST.AST
  }> {}
}

export type ClassError =
  | InstanceType<typeof ClassError.NotAClassTransform>
  | InstanceType<typeof ClassError.MissingClassIdentifier>
