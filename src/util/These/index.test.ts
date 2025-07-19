import {getTheseArbitrary, getZipResultsArbitrary} from '#test'
import {SemigroupEvery} from '@effect/typeclass/data/Boolean'
import {getOptionalMonoid} from '@effect/typeclass/data/Option'
import {Semigroup as StringSemigroup} from '@effect/typeclass/data/String'
import {Array, Boolean, Either, Option, String, Tuple, flow} from 'effect'
import {
  Law,
  type Mono,
  associativity,
  inverse,
  lawTests,
  monoEquivalence,
  monoMonoid,
  monoOrder,
  option,
  tinyArray,
  tinyString,
} from 'effect-ts-laws'
import {testTypeclassLaws, verboseLawSets} from 'effect-ts-laws/vitest'
import {type Equivalence} from 'effect/Equivalence'
import fc from 'fast-check'
import {type Pair} from '../Pair.js'
import * as These from '../These.js'

describe('These', () => {
  describe('laws', () => {
    type Iut = These.These<Mono, Option.Option<boolean>>

    const [OptionEquivalence, OptionOrder, OptionArbitrary, OptionSemigroup] = [
      Option.getEquivalence(Boolean.Equivalence),
      Option.getOrder(Boolean.Order),
      option(fc.boolean()),
      getOptionalMonoid(SemigroupEvery),
    ]

    const [getEquivalence, getOrder, getArbitrary] = [
      These.getEquivalence(OptionEquivalence),
      These.getOrder(OptionOrder),
      getTheseArbitrary(OptionArbitrary),
    ]

    const Equivalence: Equivalence<Iut> = getEquivalence(monoEquivalence)

    testTypeclassLaws<
      These.TheseTypeLambda,
      never,
      unknown,
      Option.Option<boolean>
    >({
      getEquivalence,
      getArbitrary,
    })({
      Bicovariant: These.Bicovariant,
      Equivalence,
      Order: getOrder(monoOrder),
      Semigroup: These.getSemigroup(OptionSemigroup)(monoMonoid),
    })

    {
      const a = tinyArray(tinyString)

      const xs: fc.Arbitrary<These.These<string, string>[]> =
        getZipResultsArbitrary(tinyString)(tinyString)

      const stringListEquals = Array.getEquivalence(String.Equivalence)

      const stringListPairEquals: Equivalence<Pair<string[]>> =
        Tuple.getEquivalence(stringListEquals, stringListEquals)

      const theseListEquals: Equivalence<
        readonly These.These<string, string>[]
      > = Array.getEquivalence(
        These.getEquivalence(String.Equivalence)(String.Equivalence),
      )

      verboseLawSets([
        lawTests(
          'laws for zipArrays/unzipArray',

          associativity<readonly string[]>(
            {
              a,
              f: flow(These.zipArrays<string, string>, concat),
              equals: stringListEquals,
            },
            'zipArrays(a, zipArrays(b, c)) = zipArrays(zipArrays(a, b), c)',
            'zipArrays associativity',
          ),
          inverse<These.These<string, string>[], Pair<readonly string[]>>(
            {
              a: xs,
              f: These.unzipArray,
              g: (
                pair: Pair<readonly string[]>,
              ): These.These<string, string>[] => [...These.zipArrays(...pair)],
              equals: theseListEquals,
            },
            'unzipArray ∘ zipArrays = id',
            'zip/unzip cancellation',
          ),

          Law(
            'zip/unzip cancellation',
            'unzipArray ∘ zipArrays = id',
            a,
            a,
          )((a, b) =>
            stringListPairEquals(These.unzipArray(These.zipArrays(a, b)), [
              a,
              b,
            ] as const),
          ),

          Law(
            'unzip/zip cancellation',
            'zipArrays ∘ unzipArray = id',
            xs,
          )(ab =>
            theseListEquals(These.zipArrays(...These.unzipArray(ab)), ab),
          ),
        ),
      ])
    }
  })

  describe('ops', () => {
    const testOp = <A>(
      name: string,
      f: (eob: These.These<string, number>) => A,
      [expectedLeft, expectedRight, expectedBoth]: [A, A, A],
    ) =>
      describe(name, () => {
        test('left', () => {
          expect(f(These.Left.from(42))).toEqual(expectedLeft)
        })
        test('right', () => {
          expect(f(These.Right.from('foo'))).toEqual(expectedRight)
        })
        test('both', () => {
          expect(f(These.Both.from('foo', 42))).toEqual(expectedBoth)
        })
      })

    testOp('leftOption', These.leftOption, [
      Option.some(42),
      Option.none(),
      Option.some(42),
    ])

    testOp('rightOption', These.rightOption, [
      Option.none(),
      Option.some('foo'),
      Option.some('foo'),
    ])

    testOp('onlyOne', These.onlyOne<string, number>, [
      Option.some(Either.left(42)),
      Option.some(Either.right('foo')),
      Option.none(),
    ])

    testOp('onlyLeft', These.onlyLeft, [
      Option.some(42),
      Option.none(),
      Option.none(),
    ])
    testOp('onlyRight', These.onlyRight, [
      Option.none(),
      Option.some('foo'),
      Option.none(),
    ])
    testOp('onlyBoth', These.onlyBoth, [
      Option.none(),
      Option.none(),
      Option.some(['foo', 42]),
    ])

    testOp<These.These<number, string>>('swap', These.swap, [
      These.Right({right: 42}),
      These.Left({left: 'foo'}),
      These.Both({left: 'foo', right: 42}),
    ])

    testOp<[Option.Option<string>, Option.Option<number>]>(
      'pad',
      These.pad<string, number>,
      [
        [Option.none(), Option.some(42)],
        [Option.some('foo'), Option.none()],
        [Option.some('foo'), Option.some(42)],
      ],
    )

    describe('zip arrays', () => {
      test('same length', () => {
        expect(These.zipArrays([1, 2, 3], ['a', 'b', 'c'])).toEqual([
          These.Both.from(1, 'a'),
          These.Both.from(2, 'b'),
          These.Both.from(3, 'c'),
        ])
      })

      test('left longer', () => {
        expect(These.zipArrays([1, 2, 3, 4], ['a', 'b'])).toEqual([
          These.Both.from(1, 'a'),
          These.Both.from(2, 'b'),
          These.Right.from(3),
          These.Right.from(4),
        ])
      })

      test('right longer', () => {
        expect(These.zipArrays([1, 2], ['a', 'b', 'c', 'd'])).toEqual([
          These.Both.from(1, 'a'),
          These.Both.from(2, 'b'),
          These.Left.from('c'),
          These.Left.from('d'),
        ])
      })

      test('both empty', () => {
        expect(These.zipArrays([], [])).toEqual([])
      })

      test('left empty', () => {
        expect(These.zipArrays([1, 2, 3], [])).toEqual([
          These.Right.from(1),
          These.Right.from(2),
          These.Right.from(3),
        ])
      })

      test('right empty', () => {
        expect(These.zipArrays([], ['a', 'b', 'c'])).toEqual([
          These.Left.from('a'),
          These.Left.from('b'),
          These.Left.from('c'),
        ])
      })
    })
  })
})

const concat: (
  xs: readonly These.These<string, string>[],
) => readonly string[] = Array.map(These.join(StringSemigroup))
