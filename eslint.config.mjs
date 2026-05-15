/**
 * ESLint Flat Config (Next.js 16 + ESLint 9).
 * 출처: docs/sprint/02-sprint-mvp/phase-2-design/coding-conventions.md
 *
 * Next.js 16 eslint-config-next는 flat config 형식으로 직접 import한다.
 * FlatCompat을 통한 string-based extends는 충돌(circular structure) 발생.
 */
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // ─── Base: TypeScript + JSX ───
  {
    files: ['**/*.{ts,tsx,mts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@next/next': nextPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // Next.js core rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // React Hooks
      ...reactHooksPlugin.configs.recommended.rules,

      // TypeScript strict
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // 코드 품질
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  // ─── Test files: 일부 규칙 완화 ───
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
    },
  },

  // ─── ignores ───
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.vercel/**',
      'dist/**',
      'build/**',
      'next-env.d.ts',
      '**/*.config.{mjs,js,ts}',
    ],
  },
);
