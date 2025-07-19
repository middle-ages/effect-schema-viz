import type {Semigroup} from '@effect/typeclass/Semigroup'
import {Array, Either, flow, Function, identity, Option, pipe} from 'effect'
import {fanout} from '../Pair.js'
import {
  Both,
  isBoth,
  isLeft,
  isRight,
  Left,
  match,
  Right,
  type These,
} from './index.js'

export const [leftOption, rightOption, onlyLeft, onlyRight]: [
  <R, E>(self: These<R, E>) => Option.Option<E>,
  <R, E>(self: These<R, E>) => Option.Option<R>,
  <R, E>(self: These<R, E>) => Option.Option<E>,
  <R, E>(self: These<R, E>) => Option.Option<R>,
] = [
  self =>
    isLeft(self) || isBoth(self) ? Option.some(self.left) : Option.none(),
  self =>
    isRight(self) || isBoth(self) ? Option.some(self.right) : Option.none(),
  self => (isLeft(self) ? Option.some(self.left) : Option.none()),
  self => (isRight(self) ? Option.some(self.right) : Option.none()),
]

export const [onlyOne, onlyBoth]: [
  <R, E>(self: These<R, E>) => Option.Option<Either.Either<R, E>>,
  <R, E>(self: These<R, E>) => Option.Option<[R, E]>,
] = [
  self =>
    isBoth(self)
      ? Option.none()
      : Option.some(
          isLeft(self) ? Either.left(self.left) : Either.right(self.right),
        ),
  self => (isBoth(self) ? Option.some([self.right, self.left]) : Option.none()),
]

/** Convert a `These` into a pair of right option and left option. */
export const pad = <R, E>(
  self: These<R, E>,
): [Option.Option<R>, Option.Option<E>] =>
  pipe(
    self,
    match({
      Left: ({left}) => [Option.none(), Option.some(left)],
      Right: ({right}) => [Option.some(right), Option.none()],
      Both: ({left, right}) => [Option.some(right), Option.some(left)],
    }),
  )

export const swap = <R, E>(self: These<R, E>): These<E, R> =>
  pipe(
    self,
    match<R, E, These<E, R>>({
      Left: ({left: right}) => Right.from(right),
      Right: ({right: left}) => Left.from(left),
      Both: ({left: right, right: left}) => Both.from(right, left),
    }),
  )

export const zipArraysWith = <R, E, Result>(
  right: readonly R[],
  left: readonly E[],
  f: (these: These<R, E>) => Result,
): readonly Result[] => {
  const delta = left.length - right.length
  return [
    ...Array.zipWith(right, left, flow(Both.from, f)),
    ...(delta === 0
      ? []
      : delta > 0
        ? pipe(
            left,
            Array.takeRight(delta),
            Array.map(flow(Left.from<R, E>, f)),
          )
        : pipe(
            right,
            Array.takeRight(-1 * delta),
            Array.map(flow(Right.from<R, E>, f)),
          )),
  ]
}

/**
 * Zip a pair of arrays. In case of arrays that are not of equal size, we do not
 * _crop_ as the default `Array.zip` does. Instead we wrap the results in a
 * {@link These}, which gives us an operation that is pleasantly associative, as
 * well as reversible with no loss of information via `unzipArray`.
 *
 * If the _left_ array is longer, the result will end in one or more `Left<A,B>`.
 *
 * If the _right_ array is longer, the result will end in one or more `Right<A,B>`.
 *
 * If they are both of equal size, all elements will be of type `Both<A,B>`.
 */
export const zipArrays: {
  <A, B>(left: readonly A[], right: readonly B[]): readonly These<A, B>[]
  <B>(right: readonly B[]): <A>(left: readonly A[]) => readonly These<A, B>[]
} = Function.dual(
  2,
  <A, B>(left: readonly A[], right: readonly B[]): readonly These<A, B>[] =>
    zipArraysWith(left, right, identity),
)

/**
 * Unzip a list of `These` into two arrays of possibly different size.
 * The inverse of {@link zipArrays} in the sense that
 * `flow(zipArrays, unzipArray)` is identity.
 */
export const unzipArray = <A, B>(
  self: readonly These<A, B>[],
): readonly [left: A[], right: B[]] =>
  pipe(
    self,
    Array.map(pad),
    fanout(
      flow(
        Array.filter(([leftOption]) => Option.isSome(leftOption)),
        Array.map(([left]) => (left as Option.Some<A>).value),
      ),

      flow(
        Array.filter(([, rightOption]) => Option.isSome(rightOption)),
        Array.map(([, right]) => (right as Option.Some<B>).value),
      ),
    ),
  )

/**
 * Use the given `Semigroup` instance to join the left and right sides of the
 * given `These` into a single value.
 */
export const join = <A>(S: Semigroup<A>) =>
  match<A, A, A>({
    Left: ({left}) => left,
    Right: ({right}) => right,
    Both: ({left, right}) => S.combine(left, right),
  })
