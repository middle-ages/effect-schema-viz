import {type AllSchema} from '#util'
import {Schema} from 'effect'
import {compileAstPrimitive} from './primitive.js'

const templateLiteral = Schema.TemplateLiteral(
  Schema.String,
  Schema.Literal('*'),
)

const uniqueSymbolName = 'effect-schema-viz/test/schema/primitive'

const uniqueSymbol = Symbol.for(uniqueSymbolName)

enum Fruits {
  Apple,
  Banana,
}

const testPrimitive = (name: string, schema: AllSchema, expected: string) => {
  test(name, () => {
    expect(compileAstPrimitive(schema.ast).display).toBe(expected)
  })
}

describe('primitive', () => {
  testPrimitive('enums', Schema.Enums(Fruits), '“Apple” | “Banana”')

  testPrimitive('literal string', Schema.Literal('foo'), '"foo"')
  testPrimitive('literal number', Schema.Literal(42), '42')

  testPrimitive(
    'unique symbol',
    Schema.UniqueSymbolFromSelf(uniqueSymbol),
    `Symbol(${uniqueSymbolName})`,
  )

  testPrimitive('template literal', templateLiteral, '`${string}*`')

  testPrimitive('string', Schema.String, 'string')
  testPrimitive('number', Schema.Number, 'number')
  testPrimitive('boolean', Schema.Boolean, 'boolean')
  testPrimitive('object', Schema.Object, 'object')
  testPrimitive('undefined', Schema.Undefined, 'undefined')
  testPrimitive('void', Schema.Void, 'void')
  testPrimitive('any', Schema.Any, 'any')
  testPrimitive('unknown', Schema.Unknown, 'unknown')
  testPrimitive('never', Schema.Never, 'never')
  testPrimitive('bigint', Schema.BigIntFromSelf, 'bigint')
})
