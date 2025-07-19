import {Struct} from '#annotations'
import {it} from '@effect/vitest'
import {Effect, Schema} from 'effect'
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
  it.effect('named struct', () =>
    Effect.gen(function* () {
      const result = yield* iut(NamedStructSchema)
      expect(result).toBe(`digraph "diagram" {
  "NamedStruct" [
    label = "NamedStruct";
  ];
}`)
    }),
  )

  it.effect('named struct', () =>
    Effect.gen(function* () {
      const result = yield* iut(ClassSchema)
      expect(result).toBe(`digraph "diagram" {
  "ClassSchema" [
    label = <<table cellpadding="0" cellspacing="0" cellborder="0" border="0">
<tr><td colspan="3"  border="1" sides="B" align="center">ClassSchema</td></tr>
<tr><td colspan="1" align="left">id:</td>
<td colspan="1" align="left"> </td>
<td colspan="1" align="left">number</td></tr>
</table>>;
  ];
}`)
    }),
  )

  it.effect('named struct and class', () =>
    Effect.gen(function* () {
      const result = yield* iut(NamedStructSchema, ClassSchema)
      expect(result).toBe(`digraph "diagram" {
  "NamedStruct" [
    label = "NamedStruct";
  ];
  "ClassSchema" [
    label = <<table cellpadding="0" cellspacing="0" cellborder="0" border="0">
<tr><td colspan="3"  border="1" sides="B" align="center">ClassSchema</td></tr>
<tr><td colspan="1" align="left">id:</td>
<td colspan="1" align="left"> </td>
<td colspan="1" align="left">number</td></tr>
</table>>;
  ];
}`)
    }),
  )

  it.effect('no object types', () =>
    Effect.gen(function* () {
      const result = yield* iut(Schema.Number)
      expect(result).toBe(`digraph "diagram" {
  "Compile ERROR: not an object type" [
    color = "red";
    shape = "box";
    margin = 0.08333333333333333;
    fontname = "Fira Code Retina";
    label = <<table border="0" cellborder="0">
<tr><td>Compile ERROR: not an object type</td></tr>
<tr><td>number</td></tr>
</table>>;
  ];
}`)
    }),
  )

  it.effect('anonymous struct', () =>
    Effect.gen(function* () {
      const result = yield* iut(AnonymousStructSchema)
      expect(result).toBe(`digraph "diagram" {
  "Compile ERROR: missing struct identifier" [
    color = "red";
    shape = "box";
    margin = 0.08333333333333333;
    fontname = "Fira Code Retina";
    label = <<table border="0" cellborder="0">
<tr><td>Compile ERROR: missing struct identifier</td></tr>
<tr><td>{ readonly anonymous: number }</td></tr>
</table>>;
  ];
}`)
    }),
  )

  it.effect('anonymous + named structs', () =>
    Effect.gen(function* () {
      const result = yield* iut(AnonymousStructSchema, NamedStructSchema)
      expect(result).toBe(`digraph "diagram" {
  "NamedStruct" [
    label = "NamedStruct";
  ];
  "Compile ERROR: missing struct identifier" [
    color = "red";
    shape = "box";
    margin = 0.08333333333333333;
    fontname = "Fira Code Retina";
    label = <<table border="0" cellborder="0">
<tr><td>Compile ERROR: missing struct identifier</td></tr>
<tr><td>{ readonly anonymous: number }</td></tr>
</table>>;
  ];
}`)
    }),
  )
})
