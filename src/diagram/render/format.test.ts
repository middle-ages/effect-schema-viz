import {it} from '@effect/vitest'
import {Effect, pipe} from 'effect'
import {formatDisplay, formatNode} from './format.js'
import {Node, PropertySignature, Reference} from '#model'

describe('format', () => {
  describe('formatDisplay', () => {
    it.effect('ok', () =>
      Effect.gen(function* () {
        const result = yield* formatDisplay('((string))[]')
        expect(result).toBe('string[]')
      }),
    )

    it.effect('ok - no change', () =>
      Effect.gen(function* () {
        const result = yield* formatDisplay('string[]')
        expect(result).toBe('string[]')
      }),
    )

    it.effect('formatting error', () =>
      Effect.gen(function* () {
        const result = yield* pipe(
          '[]number/string[]',
          formatDisplay,
          Effect.flip,
        )
        expect(result.message).toMatch(/';' expected/)
      }),
    )
  })

  describe('formatNode', () => {
    it.effect('ok', () =>
      Effect.gen(function* () {
        const result = yield* formatNode(
          Node('Foo', [
            PropertySignature({
              name: 'foo',
              reference: Reference.Primitive('(1|2)'),
            }),
          ]),
        )

        expect(result).toEqual(
          Node('Foo', [
            PropertySignature({
              name: 'foo',
              reference: Reference.Primitive('1 | 2'),
            }),
          ]),
        )
      }),
    )
  })
})
