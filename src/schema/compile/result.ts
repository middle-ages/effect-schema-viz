import {Node} from '#model'
import {prefix, These, toSpacedLowercase} from '#util'
import {Array, Data, Either, pipe, type SchemaAST} from 'effect'
import type {ClassError} from './class.js'
import type {StructError} from './struct.js'

export type Error = StructError | ClassError | NoObjectTypesFound

export type Result = Either.Either<Node, Error>

export type FoundResults = These.These<
  Array.NonEmptyReadonlyArray<Node>,
  Array.NonEmptyReadonlyArray<Error>
>

export type Results = FoundResults | NoObjectTypesFound

export type PartitionResult = [nodes: readonly Node[], errors: readonly Error[]]

export class NoObjectTypesFound extends Data.TaggedError('NoObjectTypesFound')<{
  ast: SchemaAST.AST
}> {}

export const noObjectTypesFound = (ast: SchemaAST.AST): NoObjectTypesFound =>
  new NoObjectTypesFound({ast})

export const isNoObjectTypesFound = (
  error: Error,
): error is NoObjectTypesFound => error._tag === 'NoObjectTypesFound'

export const isNoObjectTypesFoundResult = (
  results: Results,
): results is NoObjectTypesFound =>
  '_tag' in results && results['_tag'] === 'NoObjectTypesFound'

/** Convert the error into a node for display */
export const asNode = ({_tag: name}: Error): Node => {
  const label = pipe(name, toSpacedLowercase, prefix('ERROR: '))
  return Node(label, [], {color: 'red', shape: 'box', label})
}

/** Partition the result into nodes and errors. */
export const partition: (results: Results) => PartitionResult = results =>
  isNoObjectTypesFoundResult(results)
    ? [[], []]
    : pipe(
        results,
        These.match<readonly Node[], readonly Error[], PartitionResult>({
          Right: ({right}) => [right, []] as const,
          Left: ({left}) => [[], left] as const,
          Both: ({left, right}) => [right, left] as const,
        }),
      )

/**
 * Combine the compile results of several nodes into a single result. The result
 * will have either:
 *
 * 1. A non-empty list of nodes.
 * 1. A non-empty list of error.
 * 1. Both.
 */
export const combine = ([
  head,
  ...tail
]: Array.NonEmptyReadonlyArray<Result>): FoundResults =>
  Array.reduce(
    tail,
    pipe(
      head,
      Either.match({
        onLeft: error => onlyErrors([error]),
        onRight: node => onlyNodes([node]),
      }),
    ),
    combineStep,
  )

const combineStep = (self: FoundResults, that: Result): FoundResults =>
  pipe(
    self,
    These.match({
      Right: ({right}) => pipe(that, combineSelfNode(right)),
      Left: ({left}) => pipe(that, combineSelfError(left)),
      Both: ({left: selfLeft, right: selfRight}) =>
        pipe(
          that,
          These.match({
            Left: ({left}) => nodesAndErrors(selfRight, [...selfLeft, left]),
            Right: ({right}) => nodesAndErrors([...selfRight, right], selfLeft),
            Both: ({left, right}) =>
              nodesAndErrors([...selfRight, right], [...selfLeft, left]),
          }),
        ),
    }),
  )

const onlyNodes = These.Right.from<
  Array.NonEmptyReadonlyArray<Node>,
  Array.NonEmptyReadonlyArray<Error>
>

const onlyErrors = These.Left.from<
  Array.NonEmptyReadonlyArray<Node>,
  Array.NonEmptyReadonlyArray<Error>
>

const nodesAndErrors = These.Both.from<
  Array.NonEmptyReadonlyArray<Node>,
  Array.NonEmptyReadonlyArray<Error>
>

const combineSelfNode = (
  selfNodes: Array.NonEmptyReadonlyArray<Node>,
): ((that: Result) => FoundResults) =>
  These.match({
    Left: ({left}) => nodesAndErrors(selfNodes, [left]),
    Right: ({right}) => onlyNodes([...selfNodes, right]),
    Both: ({left, right}) => nodesAndErrors([...selfNodes, right], [left]),
  })

const combineSelfError = (
  selfErrors: Array.NonEmptyReadonlyArray<Error>,
): ((that: Result) => FoundResults) =>
  These.match({
    Left: ({left}) => onlyErrors([...selfErrors, left]),
    Right: ({right}) => nodesAndErrors([right], selfErrors),
    Both: ({left, right}) => nodesAndErrors([right], [...selfErrors, left]),
  })
