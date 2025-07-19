import {ClassNode, PropertySignature, Reference} from '#model'
import {it} from '@effect/vitest'
import {Effect, pipe, Schema} from 'effect'
import {compileClass, compileClassAst} from './class.js'

describe('class', () => {
  class Person extends Schema.Class<Person>('Person')({
    id: Schema.Number,
    name: Schema.String,
  }) {}

  class Family extends Schema.Class<Family>('Family')({
    id: Schema.Number,
    people: Schema.Array(Person),
  }) {}

  it.effect('basic', () =>
    Effect.gen(function* () {
      const result = yield* compileClass(Person)
      expect(result).toEqual(
        ClassNode('Person', [
          PropertySignature({
            name: 'id',
            reference: Reference.Primitive('number'),
          }),
          PropertySignature({
            name: 'name',
            reference: Reference.Primitive('string'),
          }),
        ]),
      )
    }),
  )

  it.effect('with relations', () =>
    Effect.gen(function* () {
      const result = yield* compileClass(Family)
      expect(result).toEqual(
        ClassNode('Family', [
          PropertySignature({
            name: 'id',
            reference: Reference.Primitive('number'),
          }),
          PropertySignature({
            name: 'people',
            reference: Reference('Person[]', ['Person']),
          }),
        ]),
      )
    }),
  )

  it.effect('not a class', () =>
    Effect.gen(function* () {
      const result = yield* pipe(
        Schema.Number.ast,
        compileClassAst,
        Effect.flip,
      )
      expect(result._tag).toEqual('NotAClassTransform')
    }),
  )
})
