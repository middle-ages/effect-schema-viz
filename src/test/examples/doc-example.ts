#!/usr/bin/env tsx

import {Schema} from 'effect'
import {schemasToDot} from 'effect-schema-viz'

class Person extends Schema.Class<Person>('Person')({
  id: Schema.Number,
  name: Schema.String,
}) {}

console.log(schemasToDot('example')(Person))
