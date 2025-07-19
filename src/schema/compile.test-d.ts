import {
  schemas,
  type AnyClassOf,
  type AnyObjectType,
  type ObjectType,
  type Results,
} from '#compile'
import {Schema, type Effect} from 'effect'

describe('compile types', () => {
  class Foo extends Schema.Class<Foo>('Foo')({
    foo: Schema.Number,
  }) {}

  class Bar extends Schema.Class<Bar>('Bar')({
    bar: Schema.Number,
  }) {}

  test('AnyClassOf', () => {
    expectTypeOf(Foo).toExtend<
      AnyClassOf<Foo, Record<'foo', Schema.Annotable.Any>>
    >()
  })

  test('ObjectType', () => {
    expectTypeOf(Foo).toExtend<
      ObjectType<any, Record<'foo', Schema.Annotable.Any>>
    >()
  })

  test('AnyObjectType', () => {
    expectTypeOf<typeof Foo>().toExtend<AnyObjectType<'foo'>>()
  })

  test('compileSchemas', () => {
    expectTypeOf(schemas([Foo, Bar])).toEqualTypeOf<Effect.Effect<Results>>()
  })
})
