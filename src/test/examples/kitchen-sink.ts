#!/usr/bin/env tsx

import {Schema} from 'effect'
import {schemasToDot, setNodeAttributes, Struct} from 'effect-schema-viz'

const uniqueSymbolName = 'effect-schema-viz/test/schema'
const uniqueSymbol = Symbol.for(uniqueSymbolName)

enum Fruits {
  Apple,
  Banana,
  Mango,
}

const Person = setNodeAttributes({
  shape: 'box',
  style: 'filled',
  fillcolor: 'white',
  fontname: 'CMU Typewriter Text',
})(
  class Person extends Schema.Class<Person>('Person')({
    name: Schema.String,
  }) {},
)

export const KitchenSink = Struct.styled('KitchenSink', {
  shape: 'plain',
  style: 'filled',
  fillcolor: 'white',
  fontname: 'CMU Typewriter Text',
})({
  string: Schema.String,
  number: Schema.Number,
  boolean: Schema.Boolean,
  object: Schema.Object,
  undefined: Schema.Undefined,
  void: Schema.Void,
  any: Schema.Any,
  unknown: Schema.Unknown,
  never: Schema.Never,
  bigint: Schema.BigIntFromSelf,

  literalNumber: Schema.Literal(42),
  literalString: Schema.Literal('foo'),
  templateLiteral: Schema.TemplateLiteral('http://', Schema.String),
  uniqueSymbol: Schema.UniqueSymbolFromSelf(uniqueSymbol),
  enums: Schema.Enums(Fruits),
  literalUnion: Schema.Literal('bar', 123, 'baz'),

  pair: Schema.Tuple(Schema.String, Schema.Number),
  tupleOptional: Schema.Tuple(
    Schema.Literal('foo'),
    Schema.optionalElement(Schema.Literal('bar')),
  ),
  restTuple: Schema.Tuple([Schema.String], Schema.Number),
  array: Schema.Array(Schema.Boolean),

  person: Person,
  personUnion: Schema.Union(Person, Schema.Null, Schema.Undefined),
  personPair: Schema.Tuple(Person, Person),
  personOptionalPair: Schema.Tuple(Person, Schema.optionalElement(Person)),
  personRestTuple: Schema.Tuple([Person], Person),
  personArray: Schema.Array(Person),
})

const dot = schemasToDot('Kitchen Sink', {bgcolor: 'grey75'})(
  KitchenSink,
  Person,
)

console.log(dot)
