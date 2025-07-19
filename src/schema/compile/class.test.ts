import {ClassNode, PropertySignature, Reference} from '#model'
import {errorType} from '#test'
import {Either, Schema} from 'effect'
import {compileClassAst} from './class.js'

describe('class', () => {
  class Person extends Schema.Class<Person>('Person')({
    id: Schema.Number,
    name: Schema.String,
  }) {}

  class Family extends Schema.Class<Family>('Family')({
    id: Schema.Number,
    people: Schema.Array(Person),
  }) {}

  test('basic', () => {
    expect(compileClassAst(Person.ast)).toEqual(
      Either.right(
        ClassNode('Person', [
          PropertySignature({
            name: 'id',
            reference: Reference.Primitive('number'),
          }),
          PropertySignature({
            name: 'name',
            reference: Reference.Primitive('string'),
          }),
        ]),
      ),
    )
  })

  test('with relations', () => {
    expect(compileClassAst(Family.ast)).toEqual(
      Either.right(
        ClassNode('Family', [
          PropertySignature({
            name: 'id',
            reference: Reference.Primitive('number'),
          }),
          PropertySignature({
            name: 'people',
            reference: Reference('Person[]', ['Person']),
          }),
        ]),
      ),
    )
  })

  test('not a class ast', () => {
    expect(errorType(Schema.Number.ast)).toBe('UnexpectedAst')
  })
})
