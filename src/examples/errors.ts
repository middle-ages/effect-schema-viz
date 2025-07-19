#!/usr/bin/env tsx

import {Effect, Schema} from 'effect'
import {schemasToDot} from 'effect-schema-viz'

const dot = await Effect.runPromise(
  schemasToDot('example')(
    Schema.Number,
    Schema.Struct({
      id: Schema.Number,
    }),
  ),
)

console.log(dot)
