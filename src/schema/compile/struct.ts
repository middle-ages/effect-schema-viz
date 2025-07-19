import {Node} from '#model'
import {Array, Schema, Data, Either, Option, pipe, SchemaAST} from 'effect'
import {getAttributes} from '../annotations.js'
import {compilePropertySignatureAst} from './signature.js'

/** Compile a schema `Struct` into a diagram node or an error. */
export const compileStruct = <Fields extends Schema.Struct.Fields>({
  ast,
}: Schema.Struct<Fields>): Either.Either<Node, StructError> =>
  compileStructAst(ast)

export const compileStructAst = (
  ast: SchemaAST.AST,
): Either.Either<Node, StructError> => {
  if (ast._tag !== 'TypeLiteral') {
    return unexpectedAst(ast)
  }

  return pipe(
    ast,
    SchemaAST.getIdentifierAnnotation,
    Option.match({
      onNone: () => missingIdentifier(ast),
      onSome: identifier =>
        Either.right(
          Node(
            identifier,
            Array.map(ast.propertySignatures, compilePropertySignatureAst),
            ...getAttributes(ast),
          ),
        ),
    }),
  )
}

export const isStructAst = (ast: SchemaAST.AST): ast is SchemaAST.Literal =>
  SchemaAST.isTypeLiteral(ast)

export const [unexpectedAst, missingIdentifier] = [
  (ast: SchemaAST.AST) => Either.left(new StructError.UnexpectedAst({ast})),
  (ast: SchemaAST.AST) => Either.left(new StructError.MissingIdentifier({ast})),
]

/** An error that prevented the node from compiling. */
export namespace StructError {
  export class UnexpectedAst extends Data.TaggedError('UnexpectedAst')<{
    ast: SchemaAST.AST
  }> {}

  export class MissingIdentifier extends Data.TaggedError('MissingIdentifier')<{
    ast: SchemaAST.AST
  }> {}
}

export type StructError =
  | InstanceType<typeof StructError.UnexpectedAst>
  | InstanceType<typeof StructError.MissingIdentifier>
