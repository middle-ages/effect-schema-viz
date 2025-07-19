import {surround, unlines, unwords} from '#util'
import {Array, pipe, Record} from 'effect'
import {Node, type Signature} from '../model.js'

export type CellSide = 'T' | 'B' | 'L' | 'R'

export type CellSides =
  `${CellSide}${CellSide | ''}${CellSide | ''}${CellSide | ''}`

/** Style for Graphviz HTML-like labels. */
export interface TableStyle {
  showSignatures: boolean

  headerSeparator: boolean
  rowSeparators: boolean
  columnSeparators: boolean

  paddingPx: number
  spacingPx: number

  borderPx: number
  headerBorderPx: number
  headerBorderSides: CellSides
}

export const defaultTableStyle: TableStyle = {
  showSignatures: true,

  headerSeparator: true,
  rowSeparators: false,
  columnSeparators: false,

  paddingPx: 0,
  spacingPx: 0,

  borderPx: 0,
  headerBorderPx: 1,
  headerBorderSides: 'B',
}

export const buildTable = (
  {name, signatures}: Node,
  tableStyle?: Partial<TableStyle>,
): string => {
  const style = {...defaultTableStyle, ...tableStyle}
  const {showSignatures, headerBorderPx, headerBorderSides} = style

  const headerRow = tr(
    td(
      name,
      showSignatures && signatures.length > 0 ? 3 : 1,
      buildAttributes({
        border: headerBorderPx,
        sides: headerBorderSides,
        align: 'center',
      }),
    ),
  )

  const signatureRows = showSignatures
    ? Array.map(signatures, buildSignatureRow)
    : []

  return pipe([headerRow, ...signatureRows], unlines, table(style))
}

const buildSignatureRow = ({name, reference}: Signature) =>
  pipe([td(`${name.toString()}:`), td(' '), td(reference.display)], unlines, tr)

const table = ({paddingPx: cellpadding, spacingPx: cellspacing}: TableStyle) =>
  surround.rest(
    `<table${buildAttributes({cellpadding, cellspacing, cellborder: 0, border: 0})}>\n`,
    `\n</table>`,
  )

const tr = surround.rest('<tr>', '</tr>')

const td = (content: string, colSpan = 1, attributes = 'align="left"') =>
  `<td colspan="${colSpan.toString()}" ${attributes}>${content}</td>`

const buildAttributes = (attributes: Record<string, string | number>): string =>
  pipe(
    attributes,
    Record.toEntries,
    Array.map(([key, value]) => ` ${key}="${value.toString()}"`),
    unwords,
  )
