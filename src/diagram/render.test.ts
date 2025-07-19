import {Node, PropertySignature, Reference} from './model.js'
import {renderNodes} from './render.js'

const Foo = Node(
  'Foo',
  [PropertySignature({name: 'bar', reference: Reference.Primitive('string')})],
  {label: 'Foo'},
)

const Baz = Node(
  'Baz',
  [PropertySignature({name: 'foo', reference: Reference.Node('Foo')})],
  {label: 'Baz'},
)

const expectedFoo = `  "Foo" [\n    label = "Foo";\n  ];\n`
const expectedBaz = `  "Baz" [\n    label = "Baz";\n  ];\n`

describe('render', () => {
  test('single type', () => {
    expect(renderNodes('Graph')([Foo])).toBe(
      `digraph "Graph" {\n${expectedFoo}}`,
    )
  })

  test('with edge', () => {
    expect(renderNodes('Graph')([Foo, Baz])).toBe(
      `digraph "Graph" {\n${expectedFoo}${expectedBaz}  "Baz" -> "Foo";\n}`,
    )
  })

  test('with graph options', () => {
    expect(renderNodes('Graph', {rankdir: 'BT'})([Foo])).toBe(
      `digraph "Graph" {\n  rankdir = "BT";\n${expectedFoo}}`,
    )
  })
})
