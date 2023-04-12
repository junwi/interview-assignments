module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'import'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
    ],
    env: {
      node: true,
      es6: true,
    },
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    "settings": {
      "import/resolver": {
        "node": {
          "extensions": [".ts", ".tsx"],
          "moduleDirectory": ["src", "node_modules"]
        }
      }
    },
    rules: {
      // Add your own rules here
    },
  };