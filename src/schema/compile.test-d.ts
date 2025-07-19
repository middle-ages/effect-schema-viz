import {
  compileSchemas,
  type AnyClassOf,
  type AnyObjectType,
  type CompileResult,
  type ObjectType,
} from '#compile'
import {Schema} from 'effect'

describe('compile types', () => {
  class Foo extends Schema.Class<Foo>('Foo')({
    foo: Schema.Number,
  }) {}

  class Bar extends Schema.Class<Bar>('Bar')({
    bar: Schema.Number,
  }) {}

  test('AnyClassOf', () => {
    expectTypeOf(Foo).toExtend<
      AnyClassOf<typeof Foo, Record<'foo', Schema.Annotable.Any>>
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
    expectTypeOf(
      compileSchemas([Foo, Bar]),
    ).toEqualTypeOf<CompileResult.Results>()
  })
})
