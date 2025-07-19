import {Reference} from '#model'
import {Array, identity, pipe} from 'effect'
import {isEnums, type AST} from 'effect/SchemaAST'
import {surround, unwords} from '#util'

/**
 * Compile an element of the Effect/Schema AST that can never have any
 * references to named object types.
 *
 * `Schema.String` and `Schema.Enums` are in this group, for example.
 */
export const compileAstPrimitive = (ast: AST): Reference =>
  Reference.Primitive(
    isEnums(ast)
      ? pipe(
          ast.enums,
          Array.map(([value]) =>
            (typeof value === 'string' ? surround.quote.fancy : identity)(
              value,
            ),
          ),
          unwords.pipeline,
        )
      : ast.toString(),
  )
