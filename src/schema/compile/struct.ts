import {Node} from '#model'
import {
  Array,
  Data,
  Effect,
  Either,
  Option,
  pipe,
  Schema,
  SchemaAST,
} from 'effect'
import {getAttributes} from '../annotations.js'
import {compilePropertySignatureAst} from './signature.js'

/** Compile a schema `Struct` into a diagram node or an error. */
export const compileStruct = <Fields extends Schema.Struct.Fields>({
  ast,
}: Schema.Struct<Fields>): Effect.Effect<Node, MissingStructIdentifier> =>
  compileStructAst(ast as SchemaAST.TypeLiteral)

export const compileStructAst = (
  ast: SchemaAST.TypeLiteral,
): Effect.Effect<Node, MissingStructIdentifier> =>
  pipe(
    ast,
    SchemaAST.getIdentifierAnnotation,
    Option.match({
      onNone: () => missingStructIdentifier(ast),
      onSome: identifier =>
        Effect.succeed(
          Node(
            identifier,
            Array.map(ast.propertySignatures, compilePropertySignatureAst),
            ...getAttributes(ast),
          ),
        ),
    }),
  )

export const missingStructIdentifier = (ast: SchemaAST.AST) =>
  Either.left(new MissingStructIdentifier({message: ast.toString()}))

/** Error thrown on encountering anonymous structs. */
export class MissingStructIdentifier extends Data.TaggedError(
  'MissingStructIdentifier',
)<{
  message: string
}> {}
