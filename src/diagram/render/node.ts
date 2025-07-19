import {Node} from '#model'
import {surround} from '#util'
import type {EdgeAttributesObject, RootGraphModel} from 'ts-graphviz'
import {buildTable} from './table.js'
import {flow, Effect, pipe} from 'effect'
import {formatNode, type FormattingError} from './format.js'

/** Add the node to the given graph. */
export const addNode =
  (graph: RootGraphModel) =>
  (node: Node): Effect.Effect<RootGraphModel, FormattingError> =>
    pipe(node, formatNode, Effect.map(addFormattedNode(graph)))

const addFormattedNode = (graph: RootGraphModel) => (node: Node) => {
  const {name, edgeAttributes = {}, nodeAttributes = {}} = node
  const {label = buildLabel(node)} = nodeAttributes

  graph.node(name, {...nodeAttributes, label})

  return renderEdges(graph)(node, edgeAttributes)
}

const buildLabel = flow(buildTable, surround.angledBrackets)

const renderEdges =
  (graph: RootGraphModel) =>
  (node: Node, edgeAttributes: EdgeAttributesObject): RootGraphModel => {
    for (const target of Node.collectTargets(node)) {
      graph.edge([node.name, target], edgeAttributes)
    }
    return graph
  }
