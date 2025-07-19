import {Node} from '#model'
import {isFormattingError, type FormattingError} from '#render'
import {prefix, toSpacedLowercase} from '#util'
import {Data, pipe, type SchemaAST} from 'effect'
import type {ClassError} from './class.js'
import type {MissingStructIdentifier} from './struct.js'

export type Error =
  | MissingStructIdentifier
  | ClassError
  | FormattingError
  | NotAnObjectType

/** The error returned when a non-object type schema is found. */
export class NotAnObjectType extends Data.TaggedError('NotAnObjectType')<{
  message: string
}> {}

export const notAnObjectType = (ast: SchemaAST.AST): NotAnObjectType =>
  new NotAnObjectType({message: ast.toString()})

export const isNotAnObjectType = (error: {
  _tag: string
}): error is NotAnObjectType => error._tag === 'NotAnObjectType'

/** Convert the error into a node for display */
export const errorAsNode = (error: Error): Node => {
  const {message} = error
  const header = isFormattingError(error) ? 'Format' : 'Compile'
  return pipe(
    error._tag,
    toSpacedLowercase,
    prefix(`${header} ERROR: `),
    errorNode(message),
  )
}

const errorNode = (rawMessage: string) => (label: string) => {
  const message = rawMessage
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
  return Node(label, [], {
    color: 'red',
    shape: 'box',
    margin: 1 / 12,
    fontname: 'Fira Code Retina',
    label: `<<table border="0" cellborder="0">
<tr><td>${label}</td></tr>
<tr><td>${message}</td></tr>
</table>>`,
  })
}
