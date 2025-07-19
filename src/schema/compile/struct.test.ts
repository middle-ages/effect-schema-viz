import {Struct} from '#annotations'
import {Node, PropertySignature, Reference} from '#model'
import {it} from '@effect/vitest'
import {Effect, pipe, Schema} from 'effect'
import {pluck} from '../../util.js'
import {compileStruct} from './struct.js'

const Foo = Struct.named('Foo')({foo: Schema.Literal('Foo')})

const Bar = Struct.named('Bar')({
  foo: Foo,
  bar: Schema.optionalWith(Schema.Literal('Bar'), {exact: true}),
})

describe('struct', () => {
  it.effect('basic', () =>
    Effect.gen(function* () {
      const result = yield* compileStruct(Foo)
      expect(result).toEqual(
        Node('Foo', [
          PropertySignature({
            name: 'foo',
            reference: Reference.Primitive('"Foo"'),
          }),
        ]),
      )
    }),
  )

  it.effect('with relations', () =>
    Effect.gen(function* () {
      const result = yield* compileStruct(Bar)
      expect(result).toEqual(
        Node('Bar', [
          PropertySignature({
            name: 'foo',
            reference: Reference.Node('Foo'),
          }),
          PropertySignature({
            name: 'bar',
            reference: Reference.Primitive('"Bar"?'),
          }),
        ]),
      )
    }),
  )

  it.effect('not identifier', () =>
    Effect.gen(function* () {
      const result = yield* pipe(
        Schema.Struct({foo: Schema.Number}),
        compileStruct,
        Effect.flip,
        Effect.map(pluck('_tag')),
      )
      expect(result).toEqual('MissingStructIdentifier')
    }),
  )
})
