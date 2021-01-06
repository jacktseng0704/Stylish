module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
  extends: 'eslint:recommended',
};
