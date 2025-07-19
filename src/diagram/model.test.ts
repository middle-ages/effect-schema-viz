import {Node, PropertySignature, Reference} from './model.js'

const references = [
  Reference.BigInt,
  Reference.BigInt,
  Reference.ofNode(Node('Foo', [])),
  Reference('(Foo | Bar | Baz)', ['Foo', 'Bar', 'Baz']),
] as const

const node: Node = Node('Foo', [
  PropertySignature({name: 'bar', reference: Reference.Node('Bar')}),
  PropertySignature({
    name: 'bazOrBam',
    reference: Reference('Baz | Bam', ['Bam', 'Baz']),
  }),
])

describe('model', () => {
  describe('Reference', () => {
    test('Primitive', () => {
      expect(Reference.Primitive('foo')).toEqual({display: 'foo', targets: []})
    })

    test('BigInt', () => {
      expect(Reference.BigInt).toEqual({display: 'bigint', targets: []})
    })

    test('Node', () => {
      expect(Reference.Node('Foo')).toEqual({display: 'Foo', targets: ['Foo']})
    })

    test('ofNode', () => {
      expect(Reference.ofNode(Node('Foo', []))).toEqual({
        display: 'Foo',
        targets: ['Foo'],
      })
    })

    test('collectDisplays', () => {
      expect(Reference.collectDisplays(references)).toEqual([
        'bigint',
        'bigint',
        'Foo',
        '(Foo | Bar | Baz)',
      ])
    })

    test('collectTargets', () => {
      expect(Reference.collectTargets(references)).toEqual([
        'Bar',
        'Baz',
        'Foo',
      ])
    })

    test('formatRestTuple', () => {
      expect(Reference.formatRestTuple(Reference.Node('Foo'))).toEqual({
        display: '...Foo[]',
        targets: ['Foo'],
      })
    })

    test('suffixOptional', () => {
      expect(Reference.suffixOptional(Reference.Node('Foo'))).toEqual({
        display: 'Foo?',
        targets: ['Foo'],
      })
    })
  })

  describe('Node', () => {
    test('collectTargets', () => {
      expect(Node.collectTargets(node)).toEqual(['Bam', 'Bar', 'Baz'])
    })
  })
})
