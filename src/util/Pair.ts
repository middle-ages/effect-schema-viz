export type Pair<A> = readonly [A, A]

/** Run a pair of functions on the same value and return the result tuple. */
export const fanout =
  <A, B, C>(ab: (a: A) => B, ac: (a: A) => C) =>
  (a: A): readonly [B, C] => [ab(a), ac(a)]
