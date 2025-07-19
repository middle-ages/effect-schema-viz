import {Node, PropertySignature, Reference} from '#model'
import {buildTable} from './table.js'

describe('table', () => {
  test('no signatures', () => {
    expect(buildTable(Node('Foo', [])))
      .toBe(`<table cellpadding="0" cellspacing="0" cellborder="0" border="0">
<tr><td colspan="1"  border="1" sides="B" align="center">Foo</td></tr>
</table>`)
  })

  test('signatures', () => {
    expect(
      buildTable(
        Node('Foo', [
          PropertySignature({
            name: 'foo',
            reference: Reference.Primitive('123'),
          }),
        ]),
      ),
    ).toBe(`<table cellpadding="0" cellspacing="0" cellborder="0" border="0">
<tr><td colspan="3"  border="1" sides="B" align="center">Foo</td></tr>
<tr><td colspan="1" align="left">foo:</td>
<td colspan="1" align="left"> </td>
<td colspan="1" align="left">123</td></tr>
</table>`)
  })
})
