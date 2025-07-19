#!/usr/bin/env tsx

import {Schema, pipe} from 'effect'
import {setAttributes, schemasToDot, setIdentifier} from 'effect-schema-viz'

const style = setAttributes({margin: 1 / 12, shape: 'box', fontname: 'Inter'})

// We must set an identifier on a schema before using it.
const Foo = pipe(
  {foo: Schema.String},
  Schema.Struct,
  setIdentifier('Foo'),
  style,
)

const Bar = pipe({bar: Foo}, Schema.Struct, setIdentifier('Bar'), style)

const dot = schemasToDot('basic struct example')(Foo, Bar)

console.log(dot)
