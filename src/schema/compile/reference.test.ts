import {setIdentifier, Struct} from '#annotations'
import {pipe, Schema} from 'effect'
import {compileAstReference} from './reference.js'
import type {AllSchema} from '#util'

const testReference = (
  name: string,
  schema: AllSchema,
  expected: string,
  expectedTargets: string[] = [],
) => {
  describe(name, () => {
    const actual = compileAstReference(schema.ast)
    test('display', () => {
      expect(actual.display).toBe(expected)
    })

    test('targets', () => {
      expect(actual.targets).toEqual(expectedTargets)
    })
  })
}

const transform = Schema.transform(Schema.Number, {
  decode: (s: string) => Number.parseInt(s),
  encode: (n: number) => n.toString(),
})(Schema.String)

const [AnonymousFoo, AnonymousBar] = [
  Schema.Struct({foo: Schema.Number}),
  Schema.Struct({bar: Schema.Literal('Bar')}),
]

const [NamedFoo, NamedBar] = [
  pipe(AnonymousFoo, setIdentifier('Foo')),
  pipe(AnonymousBar, setIdentifier('Bar')),
]

const NamedBaz = Struct.named('Baz')({named: NamedFoo, anonymous: AnonymousFoo})

const [
  namedTypeLiteralUnion,
  anonymousTypeLiteralUnion,
  mixedTypeLiteralUnion,
] = [
  Schema.Union(NamedFoo, NamedBar),
  Schema.Union(AnonymousFoo, AnonymousBar),
  Schema.Union(AnonymousFoo, NamedFoo),
]

const treeNodeFields = {
  value: Schema.Number,
}

interface TreeNode extends Schema.Struct.Type<typeof treeNodeFields> {
  readonly nodes: ReadonlyArray<TreeNode>
}

const TreeNode = Struct.named('TreeNode')({
  ...treeNodeFields,
  nodes: Schema.Array(Schema.suspend((): Schema.Schema<TreeNode> => TreeNode)),
})

export class Person extends Schema.Class<Person>('Person')({
  id: Schema.Number,
  name: Schema.String,
}) {}

describe('reference', () => {
  testReference('transformation', transform, 'number')
  describe('union', () => {
    testReference(
      'literals',
      Schema.Literal('Foo', 'Bar', 42),
      '("Foo" | "Bar" | 42)',
    )

    testReference('named type literals', namedTypeLiteralUnion, '(Foo | Bar)', [
      'Bar',
      'Foo',
    ])

    testReference(
      'anonymous type literals',
      anonymousTypeLiteralUnion,
      '({ readonly foo: number } | { readonly bar: "Bar" })',
    )

    testReference(
      'mixed named/anonymous type literals',
      mixedTypeLiteralUnion,
      '({ readonly foo: number } | Foo)',
      ['Foo'],
    )

    testReference(
      'only display is deduped',
      Schema.Union(NamedFoo, NamedFoo, NamedBaz),
      '(Foo | Foo | Baz)',
      ['Baz', 'Foo'],
    )

    testReference(
      'with literals',
      Schema.Union(Schema.Literal('foo'), NamedFoo, Schema.Literal(42)),
      '("foo" | Foo | 42)',
      ['Foo'],
    )
  })

  describe('tuple', () => {
    testReference(
      'literals',
      Schema.Tuple(Schema.Literal('Foo'), Schema.Literal(42)),
      '["Foo", 42]',
    )

    testReference(
      'optional element',
      Schema.Tuple(
        Schema.Literal('Foo'),
        Schema.optionalElement(Schema.Literal(42)),
      ),
      '["Foo", 42?]',
    )

    testReference(
      'named literal types',
      Schema.Tuple(NamedFoo, Schema.optionalElement(NamedBar)),
      '[Foo, Bar?]',
      ['Bar', 'Foo'],
    )

    testReference(
      'anonymous+named literal types and literals',
      Schema.Tuple(
        NamedFoo,
        Schema.Literal(42),
        Schema.optionalElement(AnonymousFoo),
      ),
      '[Foo, 42, { readonly foo: number }?]',
      ['Foo'],
    )

    testReference(
      '[string, ...number[]]',
      Schema.Tuple([Schema.String], Schema.Number),
      '[string, ...number[]]',
    )

    testReference(
      '[Foo, string, ...number[], ...boolean[]]',
      Schema.Tuple([NamedFoo, Schema.String], Schema.Number, NamedBar),
      '[Foo, string, ...number[], ...Bar[]]',
      ['Bar', 'Foo'],
    )
  })

  describe('array', () => {
    testReference('number[]', Schema.Array(Schema.Number), 'number[]')

    testReference('Foo[]', Schema.Array(NamedFoo), 'Foo[]', ['Foo'])

    testReference(
      '(Foo | Bar)[]',
      Schema.Array(Schema.Union(NamedFoo, NamedBar)),
      '(Foo | Bar)[]',
      ['Bar', 'Foo'],
    )
  })

  testReference('suspend', TreeNode, 'TreeNode', ['TreeNode'])

  testReference('class', Person, 'Person', ['Person'])
})
