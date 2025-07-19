import {it} from '@effect/vitest'
import {Effect, pipe} from 'effect'
import {digraph, toDot} from 'ts-graphviz'
import {Node, PropertySignature, Reference} from './model.js'
import {addNodes} from './render.js'

const Foo = Node('Foo', [], {label: 'Foo'})

const Bar = Node('Bar', [
  PropertySignature({name: 'foo', reference: Reference.Node('Foo')}),
  PropertySignature({
    name: 'bar',
    reference: Reference.Primitive('(((string)))'),
  }),
])

const LabeledBar = pipe(Bar, Node.setAttributes({label: 'Bar'}))

describe('render', () => {
  describe('addNodes', () => {
    describe('single type', () => {
      it.effect('ok - no change', () =>
        Effect.gen(function* () {
          const graph = digraph('diagram')
          yield* addNodes(graph)([Foo])
          expect(toDot(graph)).toBe(`digraph "diagram" {
  "Foo" [
    label = "Foo";
  ];
}`)
        }),
      )
    })

    describe('with relation', () => {
      it.effect('no signatures', () =>
        Effect.gen(function* () {
          const graph = digraph('diagram')
          yield* addNodes(graph)([LabeledBar])
          expect(toDot(graph)).toBe(`digraph "diagram" {
  "Bar" [
    label = "Bar";
  ];
  "Bar" -> "Foo";
}`)
        }),
      )

      it.effect('with signatures', () =>
        Effect.gen(function* () {
          const graph = digraph('diagram')
          yield* addNodes(graph)([Bar])
          expect(toDot(graph)).toBe(`digraph "diagram" {
  "Bar" [
    label = <<table cellpadding="0" cellspacing="0" cellborder="0" border="0">
<tr><td colspan="3"  border="1" sides="B" align="center">Bar</td></tr>
<tr><td colspan="1" align="left">foo:</td>
<td colspan="1" align="left"> </td>
<td colspan="1" align="left">Foo</td></tr>
<tr><td colspan="1" align="left">bar:</td>
<td colspan="1" align="left"> </td>
<td colspan="1" align="left">string</td></tr>
</table>>;
  ];
  "Bar" -> "Foo";
}`)
        }),
      )
    })
  })
})
