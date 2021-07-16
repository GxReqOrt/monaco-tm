const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "index.html", to: "index.html" },
        { from: "index.css", to: "index.css" },
        { from: "grammars", to: "grammars" },
        { from: "configurations", to: "configurations" },
        { from: "node_modules/vscode-oniguruma/release/onig.wasm", to: "onig.wasm" },
        { from: "localization", to: "localization" },
      ],
    })
  ],
});
