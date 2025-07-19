import {Function, HKT, pipe} from 'effect'
import {taggedEnum, type TaggedEnum} from 'effect/Data'

export type OneSide<Side extends 'left' | 'right', A> = Record<Side, A>

export type LeftSide<E> = OneSide<'left', E>
export type RightSide<R> = OneSide<'right', R>
export interface BothSides<R, E> {
  left: E
  right: R
}

/**
 * Just like `Either`, a data type representing a union of a value of the `Left`
 * type and a value of the `Right` type.
 *
 * Unlike `Either`, `These` has a third member in its union, called `Both`, that
 * has both a `Left` value _and_ a `Right` value. Representing, for example, the
 * results of an operation that can succeed partially, returning some errors with
 * its results.
 */
export type These<R, E> = TaggedEnum<{
  Left: LeftSide<E>
  Right: RightSide<R>
  Both: BothSides<R, E>
}>

/** A `These` with only a `left` and no `right`. */
export type Left<R, E> = TaggedEnum.Value<These<R, E>, 'Left'>

/** A `These` with only a `right` and no `left`. */
export type Right<R, E> = TaggedEnum.Value<These<R, E>, 'Right'>

/** A `These` with both a `right` and a `left`. */
export type Both<R, E> = TaggedEnum.Value<These<R, E>, 'Both'>

export interface TheseDefinition extends TaggedEnum.WithGenerics<2> {
  readonly taggedEnum: These<this['A'], this['B']>
}

/** `Kind<TheseTypeLambda, never, unknown, B, A> = These<A, B>` */
export interface TheseTypeLambda extends HKT.TypeLambda {
  readonly type: These<this['Target'], this['Out1']>
}

export const {
  $is: isTheseOf,
  $match,
  Left: _Left,
  Right: _Right,
  Both: _Both,
} = taggedEnum<TheseDefinition>()

export const match =
  <R, E, Result>({
    Left: onLeft,
    Right: onRight,
    Both: onBoth,
  }: {
    Left: (left: Left<R, E>) => Result
    Right: (right: Right<R, E>) => Result
    Both: (both: Both<R, E>) => Result
  }) =>
  (self: These<R, E>) =>
    pipe(
      self,
      $match({
        Left: (left: Left<R, E>): Result => onLeft(left),
        Right: (right: Right<R, E>): Result => onRight(right),
        Both: (both: Both<R, E>): Result => onBoth(both),
      }),
    )

export const [Left, Right, Both] = [
  Object.assign(_Left, {
    from: <R, E>(left: E): These<R, E> => Left({left}),
  }),
  Object.assign(_Right, {
    from: <R, E>(right: R): These<R, E> => Right({right}),
  }),
  Object.assign(_Both, {
    from: <R, E>(right: R, left: E): These<R, E> => Both({left, right}),
  }),
]

export const [isLeft, isRight, isBoth] = [
  isTheseOf('Left'),
  isTheseOf('Right'),
  isTheseOf('Both'),
]

export const setLeft: {
    <R, E, D>(self: These<R, E>, d: D): These<R, D>
    <D>(d: D): <R, E>(self: These<R, E>) => These<R, D>
  } = Function.dual(
    2,
    <R, E, D>(self: These<R, E>, d: D): These<R, D> =>
      pipe(
        self,
        match<R, E, These<R, D>>({
          Left: () => Left.from(d),
          Right: ({right}) => Both.from(right, d),
          Both: ({right}) => Both.from(right, d),
        }),
      ),
  ),
  setRight: {
    <R, E, S>(self: These<R, E>, s: S): These<S, E>
    <S>(s: S): <R, E>(self: These<R, E>) => These<S, E>
  } = Function.dual(
    2,
    <R, E, S>(self: These<R, E>, s: S): These<S, E> =>
      pipe(
        self,
        match<R, E, These<S, E>>({
          Left: ({left}) => Both.from(s, left),
          Right: () => Right.from(s),
          Both: ({left}) => Both.from(s, left),
        }),
      ),
  )
