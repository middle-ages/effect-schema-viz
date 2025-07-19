import {pipe, Array, Schema, String} from 'effect'
import {type Pair} from './util/Pair.js'
import type {UnionToIntersection} from 'effect/Types'

export * as These from './util/These.js'
export * from './util/Pair.js'

export type AllSchema = Schema.Annotable.All

/** Surround a string with the given string pair. */
export const surround =
  ([prefix, suffix]: Pair<string>): ((s: string) => string) =>
  s =>
    `${prefix}${s}${suffix}`

/** An untupled version of {@link surround}. */
surround.rest = (prefix: string, suffix: string): ((s: string) => string) =>
  surround([prefix, suffix])

/** Surround with parentheses. */
surround.parentheses = surround(['(', ')'])

/** Surround with square brackets. */
surround.squareBrackets = surround(['[', ']'])

/** Surround with angled brackets. */
surround.angledBrackets = surround(['<', '>'])

/** Single-quote a string. */
surround.quote = Object.assign(surround(["'", "'"]), {
  /** Double-quote a string. */
  double: surround(['"', '"']),

  /** Fancy-quote a string. */
  fancy: surround(['“', '”']),
})

/** Build a line from an array of words. */
export const unwords = (words: ReadonlyArray<string>): string => words.join('')

/** An untupled version of {@link unwords}. */
unwords.rest = (...words: ReadonlyArray<string>): string => unwords(words)

/** Join a string array with a pipeline (`|`) character. */
unwords.pipeline = (s: readonly string[]): string => pipe(s, Array.join(' | '))

/** Build a line by joining an array of words with commas between them. */
unwords.comma = Object.assign(
  (words: ReadonlyArray<string>): string => words.join(', '),
  {
    /** An untupled version of {@link unwords.comma}. */
    rest: (...words: ReadonlyArray<string>): string => words.join(', '),
  },
)

/** Pluck the value associated with a key from a record. */
export const pluck =
  <const K extends string>(key: K) =>
  <T extends {[L in K]: T[L]}>(o: T): T[K] =>
    o[key]

/** Raise the case of the 1st letter in the given string. */
export const toUpperCaseFirst = <const S extends string>(s: S) =>
  (s.charAt(0).toUpperCase() + s.slice(1)) as Capitalize<S>

/** Convert `SomeLongWord` into `some long word`. */
export const toSpacedLowercase = (s: string): string =>
  s === ''
    ? ''
    : pipe(
        s.replaceAll(/([A-Z])/g, ' $1'),
        String.toLowerCase,
        toUpperCaseFirst,
      ).slice(1)

/** Prefix a string. A flipped version of `String.concat`. */
export const prefix =
  (prefix: string) =>
  (s: string): string =>
    String.concat(prefix, s)

/** Suffix a string. A curried version of `String.concat`. */
export const suffix: (suffix: string) => (s: string) => string = String.concat

/** Build a multiline string from an array of lines. */
export const unlines = (lines: ReadonlyArray<string>): string =>
  lines.join('\n')

/**
 * For example:
 *
 * ```ts
 * UnionToTuple<true | 42 | 'hello'> ≡ [true, 42, 'hello']
 * ```
 */
export type UnionToTuple<Union, Tuple extends readonly unknown[] = []> = [
  Union,
] extends [UnionToIntersection<Union>]
  ? readonly [Union, ...Tuple]
  : UnionToTuple<
      Exclude<Union, PopUnion<Union>>,
      readonly [PopUnion<Union>, ...Tuple]
    >

type PopUnion<U> =
  UnionToIntersection<U extends unknown ? (f: U) => void : never> extends (
    a: infer A,
  ) => void
    ? A
    : never

/** `dedupeWith` string equivalence. */
export const dedupeStrings: (self: Iterable<string>) => typeof self =
  Array.dedupeWith(String.Equivalence)
