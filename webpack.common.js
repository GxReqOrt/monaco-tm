const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

module.exports = {
  target: 'web',
  entry: {
    app: './src/app.ts',
    // Package each language's worker and give these filenames in `getWorkerUrl`
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
  },
  output: {
    globalObject: 'self',
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
      {
        test: /\.wasm$/,
        use: ['wasm-loader'],
      },
    ],
  },
  // As suggested on:
  // https://github.com/NeekSandhu/monaco-editor-textmate/blame/45e137e5604504bcf744ef86215becbbb1482384/README.md#L58-L59
  //
  // Use the MonacoWebpackPlugin to disable all built-in tokenizers/languages.
  plugins: [
    new MonacoWebpackPlugin({languages: []}),
  ],
};
