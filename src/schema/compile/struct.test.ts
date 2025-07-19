import {Struct} from '#annotations'
import {Node, PropertySignature, Reference} from '#model'
import {errorType} from '#test'
import {Schema, Either} from 'effect'
import {compileStructAst} from './struct.js'

const Foo = Struct.named('Foo')({foo: Schema.Literal('Foo')})

const Bar = Struct.named('Bar')({
  foo: Foo,
  bar: Schema.optionalWith(Schema.Literal('Bar'), {exact: true}),
})

describe('struct', () => {
  test('basic', () => {
    expect(compileStructAst(Foo.ast)).toEqual(
      Either.right(
        Node('Foo', [
          PropertySignature({
            name: 'foo',
            reference: Reference.Primitive('"Foo"'),
          }),
        ]),
      ),
    )
  })

  test('with relations', () => {
    expect(compileStructAst(Bar.ast)).toEqual(
      Either.right(
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
      ),
    )
  })

  test('not a type literal ast', () => {
    expect(errorType(Schema.Number.ast)).toBe('UnexpectedAst')
  })

  test('no identifier', () => {
    expect(errorType(Schema.Struct({foo: Schema.Number}).ast)).toBe(
      'MissingIdentifier',
    )
  })
})
