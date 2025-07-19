import {Node} from '#model'
import {Array, Option, Either, Schema, pipe} from 'effect'
import {notAClassTransform} from './class.js'
import {asNode, combine, partition} from './result.js'
import {unexpectedAst} from './struct.js'
import {These, pluck} from '#util'

const ast = Schema.Number.ast

const [error1, error2] = [unexpectedAst(ast), notAClassTransform(ast)] as const

const [foo, bar] = [Node('Foo', []), Node('Bar', [])] as const

const results = combine([error1, Either.right(foo), error2, Either.right(bar)])

describe('result', () => {
  describe('combine', () => {
    test('nodes', () => {
      expect(These.rightOption(results)).toEqual(Option.some([foo, bar]))
    })

    test('errors', () => {
      const actualTags = pipe(
        results,
        These.leftOption,
        Option.map(Array.map(pluck('_tag'))),
        Option.toArray,
        Array.flatten,
      )

      expect(actualTags).toEqual(['UnexpectedAst', 'NotAClassTransform'])
    })
  })

  test('asNode', () => {
    expect(
      pipe(
        error1,
        Either.mapLeft(asNode),
        Either.flip,
        Either.getOrElse(() => Node('fail', [])),
        pluck('name'),
      ),
    ).toEqual('ERROR: unexpected ast')
  })

  describe('partition', () => {
    const [nodes, errors] = partition(results)
    test('nodes', () => {
      expect(nodes).toEqual([foo, bar])
    })

    test('errors', () => {
      expect(Array.map(errors, pluck('_tag'))).toEqual([
        'UnexpectedAst',
        'NotAClassTransform',
      ])
    })
  })
})
