import {foldReferences} from './fold.js'
import {Node, Reference} from './model.js'

const references = [
  Reference.BigInt,
  Reference.BigInt,
  Reference.ofNode(Node('Foo', [])),
  Reference.Node('Bar'),
  Reference.Node('Baz'),
] as const

describe('foldReferences', () => {
  test('comma', () => {
    expect(foldReferences.comma(references)).toEqual({
      display: 'bigint, bigint, Foo, Bar, Baz',
      targets: ['Bar', 'Baz', 'Foo'],
    })
  })

  test('array', () => {
    expect(foldReferences.array(references)).toEqual({
      display: '(bigint, bigint, Foo, Bar, Baz)[]',
      targets: ['Bar', 'Baz', 'Foo'],
    })
  })

  test('array singleton', () => {
    expect(foldReferences.array([Reference.Node('Foo')])).toEqual({
      display: 'Foo[]',
      targets: ['Foo'],
    })
  })

  test('tuple', () => {
    expect(foldReferences.tuple(references)).toEqual({
      display: '[bigint, bigint, Foo, Bar, Baz]',
      targets: ['Bar', 'Baz', 'Foo'],
    })
  })

  test('union', () => {
    expect(foldReferences.union(references)).toEqual({
      display: '(bigint | bigint | Foo | Bar | Baz)',
      targets: ['Bar', 'Baz', 'Foo'],
    })
  })
})
