const path = require('path');
module.exports = {
  env: {
    "browser": true,
    "node": true
  },
  parser: "@typescript-eslint/parser",
  plugins: [
    '@typescript-eslint'
  ],
  extends: "airbnb-base",
  rules: {
    "no-param-reassign": ["error", { "props": false }],
    "class-methods-use-this": "off",
    "object-curly-newline": 'off',
    "no-underscore-dangle": 'off',
    "no-continue": 'off',
  },
  settings: {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      },
      "webpack": {
        config: path.join(__dirname, './webpack.config.js')
      },
    },
  },
};
