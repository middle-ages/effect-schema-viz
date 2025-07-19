import {Array, Data, flow, identity, pipe, String} from 'effect'
import type {EdgeAttributesObject, NodeAttributesObject} from 'ts-graphviz'
import {type UnionToTuple, dedupeStrings, surround, pluck} from '#util'

export interface Reference {
  readonly display: string
  readonly targets: readonly string[]
}

export interface Named {
  readonly name: string
}

export interface BaseSignature {
  readonly name: PropertyKey
  readonly reference: Reference
}

export type Signature = Data.TaggedEnum<{
  PropertySignature: BaseSignature
  IndexSignature: BaseSignature
}>

export type Signatures = UnionToTuple<Signature>

/** A property signature of a struct or record type. */
export type PropertySignature = Signatures[0]

/** An index signature of a struct or record type. */
export type IndexSignature = Signatures[1]

/** A diagram node representing a struct or record type. */
export interface Node extends Named {
  /** List of index of property signatures. */
  signatures: readonly Signature[]

  /** True if this object-like schema is for a _class type_. */
  isClass: boolean

  /** Graphviz node options. */
  nodeOptions?: NodeAttributesObject

  /** Graphviz edge options for all edges _exiting_ from this node. */
  edgeOptions?: EdgeAttributesObject
}

export const {
  PropertySignature,
  IndexSignature,
  $is: isSignature,
  $match: matchSignature,
} = Data.taggedEnum<Signature>()

export const [isPropertySignature, isIndexSignature] = [
  isSignature('PropertySignature'),
  isSignature('IndexSignature'),
]

/**
 * A labeled, possibly empty, list of references to user types.
 *
 * For example, for some signature of some struct defined so:
 *
 * ```ts
 * const MyStruct = Schema.struct({
 *   ...
 *    mySignature: Schema.Array(MyOtherStruct),
 *   ...
 * })
 * ```
 *
 * We would expect the compiled signature of `mySignature` to have a reference
 * to:
 *
 * ```ts
 * {
 *   display: 'MyOtherStruct[]',
 *   targets: ['MyOtherStruct'],
 * }
 * ```
 */
export const Reference = (
  display: string,
  targets: readonly string[],
): Reference => ({
  display,
  targets,
})

/** References to native types with no `targets`. */
Reference.Primitive = (display: string): Reference => Reference(display, [])

/** Primitive reference to the `bigint` type. */
Reference.BigInt = Reference.Primitive('bigint')

/** A reference to a single user type. */
Reference.Node = (target: string): Reference => Reference(target, [target])

/** Convert a node into a reference to this node. */
Reference.ofNode = ({name}: Node): Reference => Reference.Node(name)

/** Collect all displays from given references. */
Reference.collectDisplays = (
  references: Array.NonEmptyReadonlyArray<Reference>,
): Array.NonEmptyReadonlyArray<string> =>
  pipe(references, Array.map(pluck('display')))

/** Collect all targets from given references. */
Reference.collectTargets = (references: readonly Reference[]): string[] =>
  pipe(references, Array.flatMap(pluck('targets')), dedupeAndSort)

/**
 * Format the reference display to match a rest tuple: prefix with `...` and
 * suffix with `[]`.
 */
Reference.formatRestTuple = ({display, ...rest}: Reference): Reference => ({
  ...rest,
  display: surround.rest('...', '[]')(display),
})

/** Suffix given string on the reference display. */
Reference.suffix =
  (s: string): ((reference: Reference) => Reference) =>
  ({display, ...rest}) => ({
    display: display + s,
    ...rest,
  })

/** Make the given reference optional. */
Reference.suffixOptional = Reference.suffix('?')

/** Make the given reference optional if the given boolean is true. */
Reference.suffixOptionalIf = (flag: boolean) =>
  flag ? Reference.suffix('?') : identity

/** Create a diagram node representing a struct or record type. */
export const Node = (
  /** Type name. */
  name: string,

  /** List of struct property and/or index signatures. */
  signatures: readonly Signature[],

  /** Optional Graphviz node options. */
  nodeOptions: NodeAttributesObject = {},

  /** Optional Graphviz edge options for all edges _exiting_ this node. */
  edgeOptions: EdgeAttributesObject = {},
): Node => ({
  name,
  signatures,
  nodeOptions,
  edgeOptions,
  isClass: false,
})

/** Create a diagram node representing a class type. */
export const ClassNode = (...args: Parameters<typeof Node>): Node => ({
  ...Node(...args),
  isClass: true,
})

/** Collect all reference targets from node signatures. */
Node.collectTargets = ({signatures}: Node): string[] =>
  pipe(signatures, Array.map(pluck('reference')), Reference.collectTargets)

const dedupeAndSort = flow(dedupeStrings, Array.sort(String.Order))
