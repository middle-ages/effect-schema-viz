import {Array, flow, pipe} from 'effect'
import {
  digraph,
  toDot,
  type GraphAttributesObject,
  type RootGraphModel,
} from 'ts-graphviz'
import {surround, unlines} from '#util'
import {Node, type Signature} from './model.js'

/** Add the given node and its edges to the given graph. */
export const addNode =
  /** Graph that will get the new node and its edges. */
  (graph: RootGraphModel) =>
    /** Node to add. */
    (node: Node): RootGraphModel => {
      const {name, nodeOptions = {}, edgeOptions = {}} = node
      const {label, ...rest} = nodeOptions

      graph.node(name, {
        label: label ?? pipe(node, buildLabel, surround.angledBrackets),
        ...rest,
      })

      const targets = Node.collectTargets(node)
      if (Array.isNonEmptyArray(targets)) {
        for (const target of targets) {
          graph.edge([node.name, target], edgeOptions)
        }
      }

      return graph
    }

/** Add the given nodes and their edges to the given graph. */
export const addNodes =
  /** Graph that will get the new nodes and edges. */
  (graph: RootGraphModel) =>
    /** Nodes to add. */
    (nodes: readonly Node[]): RootGraphModel => {
      for (const node of nodes) {
        addNode(graph)(node)
      }
      return graph
    }

/** Create a new graph made up of the given nodes. */
export const graphNodes = (
  /** Graph name. */
  name: string,

  /** Graphviz graph attributes. */
  graphAttributes?: GraphAttributesObject,
): ((nodes: Node[]) => RootGraphModel) =>
  pipe(digraph(name, graphAttributes), addNodes)

/** Create a new graph from the given nodes and render it to `dot` format. */
export const renderNodes = (
  /** Graph name. */
  name: string,

  /** Graphviz graph attributes. */
  graphAttributes?: GraphAttributesObject,
): ((nodes: Node[]) => string) => flow(graphNodes(name, graphAttributes), toDot)

const buildLabel = ({
  name,
  signatures,
}: Node): string => `<table cellspacing="0" cellpadding="0" border="0">
${tr(td(name, 3, 'align="center" border="1" sides="B"'))}
${pipe(signatures, Array.map(buildSignatureRow), unlines)}
</table>`

const buildSignatureRow = ({name, reference}: Signature) =>
  pipe([td(`${name.toString()}:`), td(' '), td(reference.display)], unlines, tr)

const tr = (content: string) => `<tr>${content}</tr>`

const td = (content: string, colSpan = 1, attributes = 'align="left"') =>
  `<td colspan="${colSpan.toString()}" ${attributes}>${content}</td>`
