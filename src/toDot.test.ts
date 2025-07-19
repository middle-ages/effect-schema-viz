import {Struct} from '#annotations'
import {surround} from '#util'
import {Schema} from 'effect'
import {schemasToDot} from './toDot.js'

const iut = schemasToDot('diagram')

const NamedStructSchema = Struct.styled('NamedStruct', {label: 'NamedStruct'})({
  name: Schema.String,
})

class ClassSchema extends Schema.Class<ClassSchema>('ClassSchema')({
  id: Schema.Number,
}) {}

const AnonymousStructSchema = Schema.Struct({anonymous: Schema.Number})

describe('schemasToDot', () => {
  test('Named struct', () => {
    expect(iut(NamedStructSchema)).toBe(
      diagram(`  "NamedStruct" [\n    label = "NamedStruct";\n  ];`),
    )
  })

  test('Class', () => {
    expect(iut(ClassSchema)).toBe(
      diagram(`  "ClassSchema" [\n    label = <${table}>;\n  ];`),
    )
  })

  test('Named struct and class', () => {
    expect(iut(NamedStructSchema, ClassSchema)).toBe(
      diagram(`  "NamedStruct" [
    label = "NamedStruct";
  ];
  "ClassSchema" [
    label = <${table}>;
  ];`),
    )
  })

  test('No object types', () => {
    expect(iut(Schema.Number, Schema.String)).toBe(
      diagram(`  "ERROR: no object types found" [
    label = "ERROR: no object types found";
    color = "red";
    shape = "box";
  ];`),
    )
  })

  test('Anonymous struct', () => {
    expect(iut(AnonymousStructSchema)).toBe(
      diagram(`  "ERROR: missing identifier" [
    label = "ERROR: missing identifier";
    color = "red";
    shape = "box";
  ];`),
    )
  })

  test('Anonymous + named structs', () => {
    expect(iut(AnonymousStructSchema, NamedStructSchema)).toBe(
      diagram(`  "NamedStruct" [
    label = "NamedStruct";
  ];
  "ERROR: missing identifier" [
    label = "ERROR: missing identifier";
    color = "red";
    shape = "box";
  ];`),
    )
  })
})

const table = `<table cellspacing="0" cellpadding="0" border="0">
<tr><td colspan="3" align="center" border="1" sides="B">ClassSchema</td></tr>
<tr><td colspan="1" align="left">id:</td>
<td colspan="1" align="left"> </td>
<td colspan="1" align="left">number</td></tr>
</table>`

const diagram = surround.rest('digraph "diagram" {\n', '\n}')
