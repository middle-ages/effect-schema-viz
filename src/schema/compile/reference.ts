import {foldReferences} from '#fold'
import {Reference} from '#model'
import {Array, Option, pipe} from 'effect'
import {flow, tupled} from 'effect/Function'
import {
  getIdentifierAnnotation,
  isDeclaration,
  isTransformation,
  type AST,
  type OptionalType,
  type Type,
} from 'effect/SchemaAST'
import {pluck} from '#util'
import {getIdentifierOrSerialize} from '../annotations.js'
import {compileAstPrimitive} from './primitive.js'

/**
 * Compile a non-object type element of the Effect/Schema AST linked by
 * references to 0…n named object types.
 *
 * The element types are:
 *
 * 1. `Schema.Transformation`
 * 1. `Schema.TypeLiteral`
 * 1. `Schema.Union`
 * 1. `Schema.Tuple`
 * 1. `Schema.Array`
 *
 * If the given AST node is of a different type, we assume it is a primitive and
 * compile it as such.
 */
export const compileAstReference = (ast: AST): Reference => {
  switch (ast._tag) {
    case 'TypeLiteral': {
      return pipe(ast, getIdentifierOrSerialize, tupled(Reference))
    }
    case 'Transformation': {
      return pipe(
        ast,
        parseClassName,
        Option.match({
          onNone: () => compileAstReference(ast.to),
          onSome: name => Reference(name, [name]),
        }),
      )
    }
    case 'Suspend': {
      return compileAstReference(ast.f())
    }
    case 'Union': {
      return pipe(
        ast.types,
        Array.map(compileAstReference),
        foldReferences.union,
      )
    }
    case 'TupleType': {
      const [astElements, astRest] = [ast.elements, ast.rest]
      const [restHead] = astRest

      return astElements.length === 0 && restHead !== undefined
        ? compileAstArray(restHead)
        : pipe(
            [...compileElements(astElements), ...compileRest(astRest)],
            Array.match({
              onEmpty: () => Reference.Primitive(ast.toString()),
              onNonEmpty: foldReferences.tuple,
            }),
          )
    }
  }

  return compileAstPrimitive(ast)
}

const compileAstArray: (restHead: Type) => Reference = a =>
  pipe(a, pluck('type'), compileAstReference, Array.of, foldReferences.array)

const compileElements: (types: readonly OptionalType[]) => Reference[] =
  Array.map(({type, isOptional}) =>
    pipe(type, compileAstReference, Reference.suffixOptionalIf(isOptional)),
  )

const compileRest: (types: readonly Type[]) => Reference[] = Array.map(
  flow(pluck('type'), compileAstReference, Reference.formatRestTuple),
)

/** Parses the identifier of a class AST. */
const parseClassName = (ast: AST): Option.Option<string> =>
  isTransformation(ast) && isDeclaration(ast.to)
    ? getIdentifierAnnotation(ast.to)
    : Option.none()
