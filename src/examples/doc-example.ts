#!/usr/bin/env tsx

import {Effect, pipe, Schema} from 'effect'
import {schemasToDot} from 'effect-schema-viz'

class Person extends Schema.Class<Person>('Person')({
  id: Schema.Number,
  name: Schema.String,
}) {}

const dot = await pipe(Person, schemasToDot('example'), Effect.runPromise)

console.log(dot)
