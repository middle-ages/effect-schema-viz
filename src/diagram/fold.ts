import {Array, flow, pipe} from 'effect'
import {suffix, surround, unwords} from '#util'
import {Reference} from './model.js'

/**
 * Fold given references into one by collecting their targets and joining their
 * displays using the given `joiner` argument.
 */
export const foldReferences =
  (joiner: (xs: Array.NonEmptyReadonlyArray<string>) => string) =>
  (references: Array.NonEmptyReadonlyArray<Reference>): Reference =>
    Reference(
      pipe(references, Reference.collectDisplays, joiner),
      Reference.collectTargets(references),
    )

/**
 * Fold the references, joining the displays with a comma, as in arrays and
 * tuples.
 */
foldReferences.comma = (
  references: Array.NonEmptyReadonlyArray<Reference>,
): Reference => pipe(references, foldReferences(unwords.comma))

/**
 * Fold the references, joining the displays with a comma, and attaching a
 * suffix indicating an array (`[]`).
 */
foldReferences.array = (references: Array.NonEmptyReadonlyArray<Reference>) =>
  pipe(
    references,
    foldReferences(([head, ...tail]) =>
      Array.isEmptyReadonlyArray(tail)
        ? pipe(head, suffix('[]'))
        : pipe(
            [head, ...tail],
            unwords.comma,
            surround.parentheses,
            suffix('[]'),
          ),
    ),
  )

/**
 * Fold the references, joining the displays with a comma, and surrounding with
 * square brackets indicating a tuple.
 */
foldReferences.tuple = (
  references: Array.NonEmptyReadonlyArray<Reference>,
): Reference =>
  pipe(references, foldReferences(flow(unwords.comma, surround.squareBrackets)))

/**
 * Fold the references, joining the displays with a pipeline (`|`) indicating a
 * union.
 */
foldReferences.union = (
  references: Array.NonEmptyReadonlyArray<Reference>,
): Reference =>
  pipe(references, foldReferences(flow(unwords.pipeline, surround.parentheses)))
