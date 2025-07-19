#!/usr/bin/env tsx

import {Effect, Schema} from 'effect'
import {schemasToDot, setAttributes} from 'effect-schema-viz'

const style = setAttributes({margin: 1 / 12, shape: 'box', fontname: 'Inter'})

class Person extends Schema.Class<Person>('Person')({
  id: Schema.Number,
  name: Schema.String,
}) {}

class Family extends Schema.Class<Person>('Family')({
  id: Schema.Number,
  people: Schema.Array(Person),
}) {}

const dot = await Effect.runPromise(
  schemasToDot('basic class example')(style(Person), style(Family)),
)

console.log(dot)
