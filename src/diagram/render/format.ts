import {Reference, type Node, type Signature} from '#model'
import {Data, Effect, pipe} from 'effect'
import {format} from 'prettier'

const prettierConfig = {
  semi: false,
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: false,
  objectWrap: 'collapse',
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  trailingComma: 'all',
  quoteProps: 'as-needed',
  parser: 'typescript',
} as const

const prefix = 'type _ = '

/**
 * Format all the reference `display` fields references in the given node.
 */
export const formatNode = ({
  signatures,
  ...rest
}: Node): Effect.Effect<Node, FormattingError> =>
  pipe(
    signatures,
    Effect.forEach(formatSignature),
    Effect.map(signatures => ({...rest, signatures}) as Node),
  )

/**
 * Run the given `display` of the reference of the given signature through the
 * Prettier code formatter.
 */
export const formatSignature = <S extends Signature>({
  reference,
  ...rest
}: S): Effect.Effect<S, FormattingError> =>
  pipe(
    reference,
    formatReference,
    Effect.map(reference => ({...rest, reference}) as S),
  )

/**
 * Run the given `display` of the given reference through the Prettier code
 * formatter.
 */
export const formatReference = ({display, targets}: Reference) =>
  pipe(display, formatDisplay, Effect.map(Reference.curried(targets)))

/**
 * Run the given `Reference.display` through the Prettier code formatter.
 */
export const formatDisplay = (
  source: string,
): Effect.Effect<string, FormattingError> =>
  Effect.tryPromise({
    try: () =>
      format(`${prefix}${source}`, prettierConfig).then(s =>
        // Prettier adds a newline which we must remove
        s.slice(prefix.length, -1),
      ),
    catch: error => {
      return formattingError(source)((error as Error).message)
    },
  })

/** The error returned when Prettier cannot format a type. */
export class FormattingError extends Data.TaggedError('FormattingError')<{
  message: string
  source: string
}> {}

export const formattingError =
  (source: string) =>
  (message: string): FormattingError =>
    new FormattingError({message, source})

export const isFormattingError = (error: {
  _tag: string
}): error is FormattingError =>
  '_tag' in error && error._tag === 'FormattingError'
