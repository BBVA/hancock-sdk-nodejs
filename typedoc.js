module.exports = {
  out: './docs',

  // readme: 'none',
  includes: './src',
  exclude: [
    '**/__tests__/**/*',
    '**/__mocks__/**/*',
    '**/node_modules/**/*'
  ],

  mode: 'file',
  excludeExternals: true,
  excludeNotExported: true,
  excludePrivate: true,
  ignoreCompilerErrors: true,
  theme: 'minimal'
};