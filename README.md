# monaco-tm

This gets TextMate grammars working in standalone Monaco by leveraging
`vscode-oniguruma` and `vscode-textmate`. For more context, see:
https://github.com/microsoft/monaco-editor/issues/1915.

## Run demo

- `npm install`
- `npm run start`
- open http://localhost:8084/

Currently, only the Python grammar and VS Code Dark+ themes are included in the
demo.

## Build for integration with GX

- `npm ci`
- `npm run build`

Copy the contents of this folder (minus `src` folder) to your genexus installation `GeneXus17/Monaco/GxReq`.
