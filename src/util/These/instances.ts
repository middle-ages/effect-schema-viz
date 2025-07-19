import {Bicovariant as BI, Semigroup} from '@effect/typeclass'
import {Equivalence, Function, Order, pipe} from 'effect'
import {
  Both,
  Left,
  match,
  Right,
  type These,
  type TheseTypeLambda,
} from './index.js'

export const bimap: BI.Bicovariant<TheseTypeLambda>['bimap'] = Function.dual(
  3,
  <E1, E2, R1, R2>(
    self: These<R1, E1>,
    f: (r: R1) => R2,
    g: (e: E1) => E2,
  ): These<R2, E2> =>
    pipe(
      self,
      match<R1, E1, These<R2, E2>>({
        Right: ({right}) => pipe(right, f, Right.from<R2, E2>),
        Left: ({left}) => pipe(left, g, Left.from<R2, E2>),
        Both: ({left, right}) => Both({left: g(left), right: f(right)}),
      }),
    ),
)

export const Bicovariant: BI.Bicovariant<TheseTypeLambda> = {bimap}

export const [mapLeft, mapRight] = [
  BI.mapLeft(Bicovariant),
  BI.map(Bicovariant),
]

export const getEquivalence =
  <E>(equalsE: Equivalence.Equivalence<E>) =>
  <R>(
    equalsR: Equivalence.Equivalence<R>,
  ): Equivalence.Equivalence<These<R, E>> =>
  (self, that) =>
    self._tag === that._tag &&
    pipe(
      self,
      match<R, E, boolean>({
        Left: ({left}) => equalsE(left, (that as Left<R, E>).left),
        Right: ({right}) => equalsR(right, (that as Right<R, E>).right),
        Both: ({left, right}) =>
          equalsE(left, (that as Left<R, E>).left) &&
          equalsR(right, (that as Right<R, E>).right),
      }),
    )

export const getOrder =
  <E>(orderE: Order.Order<E>) =>
  <R>(orderR: Order.Order<R>): Order.Order<These<R, E>> =>
  (self, that) => {
    const tagCompare = self._tag.localeCompare(that._tag)
    return (
      tagCompare === 0
        ? pipe(
            self,
            match<R, E, -1 | 0 | 1>({
              Left: ({left}) => orderE(left, (that as Left<R, E>).left),
              Right: ({right}) => orderR(right, (that as Right<R, E>).right),
              Both: ({left, right}) => {
                const [leftCompare, rightCompare] = [
                  orderE(left, (that as Left<R, E>).left),
                  orderR(right, (that as Right<R, E>).right),
                ]
                return leftCompare === 0 ? rightCompare : leftCompare
              },
            }),
          )
        : tagCompare
    ) as -1 | 0 | 1
  }

export const combine =
  <E>(eSemigroup: Semigroup.Semigroup<E>) =>
  <R>(rSemigroup: Semigroup.Semigroup<R>) =>
  (self: These<R, E>, that: These<R, E>): These<R, E> => {
    const by = match<R, E, These<R, E>>,
      [addLeft, addRight] = [eSemigroup.combine, rSemigroup.combine]

    return pipe(
      self,
      by({
        Left: ({left: selfE}) =>
          pipe(
            that,
            by({
              Left: ({left: thatE}) => Left.from(addLeft(selfE, thatE)),
              Right: ({right: thatR}) => Both.from(thatR, selfE),
              Both: ({left: thatE, right: thatR}) =>
                Both.from(thatR, addLeft(selfE, thatE)),
            }),
          ),
        Right: ({right: selfR}) =>
          pipe(
            that,
            by({
              Left: ({left: thatE}) => Both.from(selfR, thatE),
              Right: ({right: thatR}) => Right.from(addRight(selfR, thatR)),
              Both: ({left: thatE, right: thatR}) =>
                Both.from(addRight(selfR, thatR), thatE),
            }),
          ),
        Both: ({left: selfE, right: selfR}) =>
          pipe(
            that,
            by({
              Left: ({left: thatE}) => Both.from(selfR, addLeft(selfE, thatE)),
              Right: ({right: thatR}) =>
                Both.from(addRight(selfR, thatR), selfE),
              Both: ({left: thatE, right: thatR}) =>
                Both.from(addRight(selfR, thatR), addLeft(selfE, thatE)),
            }),
          ),
      }),
    )
  }

export const getSemigroup =
  <B>(semigroupB: Semigroup.Semigroup<B>) =>
  <A>(semigroupA: Semigroup.Semigroup<A>): Semigroup.Semigroup<These<A, B>> =>
    Semigroup.make(combine(semigroupB)(semigroupA))
