import * as eslint from '@eslint/js'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import sonarjs from 'eslint-plugin-sonarjs'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import {globalIgnores} from 'eslint/config'
import * as globals from 'globals'
import tslint from 'typescript-eslint'

const config = tslint.config(
  globalIgnores([
    './node_modules',
    './dist',
    './api-docs',
    './config/dependency-cruiser.cjs',
  ]),

  eslint.configs.recommended,
  ...tslint.configs.recommended,
  eslint.configs.recommended,
  tslint.configs.strictTypeChecked,
  eslintPluginUnicorn.configs.recommended,
  sonarjs.configs.recommended,
  prettierRecommended,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        ecmaVersion: 'latest',
        tsconfigRootDir: import.meta.dirname + '/..',
      },
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },

  {
    rules: {
      // Duplicated in eslint rules.
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-unused-vars': 'off',
      'sonarjs/no-unused-vars': 'off',
      'sonarjs/unused-import': 'off',
      'sonarjs/no-dead-store': 'off',

      // These get confused on methods vs. namespaced functions.
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-method-this-argument': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      '@typescript-eslint/unbound-method': 'off',

      // Does not understand @effect/vitest.
      'sonarjs/no-empty-test-file': 'off',

      // Should be only on tests.
      'sonarjs/no-nested-functions': 'off',

      // No JS linting.
      'unicorn/no-abusive-eslint-disable': 'off',

      // Not needed.
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/throw-new-error': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/void-use': 'off',

      // Can't do module augmentation.
      '@typescript-eslint/no-namespace': 'off',

      'unicorn/filename-case': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
)

export default config
