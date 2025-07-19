import {PropertySignature, Reference} from '#model'
import {pipe, SchemaAST} from 'effect'
import {compileAstReference} from './reference.js'

export const compilePropertySignatureAst = ({
  name,
  type,
  isOptional,
}: SchemaAST.PropertySignature): PropertySignature =>
  PropertySignature({
    name,
    reference: pipe(
      type,
      compileAstReference,
      Reference.suffixOptionalIf(isOptional),
    ),
  })
