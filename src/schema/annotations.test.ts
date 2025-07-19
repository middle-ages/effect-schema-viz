import {pipe, Schema} from 'effect'
import type {NodeAttributesObject} from 'ts-graphviz'
import {getAttributes, setAttributes} from '#annotations'

describe('annotations', () => {
  test('get(set)=id', () => {
    const attributes: NodeAttributesObject = {color: 'green'}
    const annotated = pipe(Schema.Number, setAttributes(attributes))
    expect(getAttributes(annotated.ast)).toEqual([attributes, {}])
  })
})
