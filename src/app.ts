import type {LanguageId} from './register';
import type {ScopeName, TextMateGrammar, ScopeNameInfo} from './providers';

// Recall we are using MonacoWebpackPlugin. According to the
// monaco-editor-webpack-plugin docs, we must use:
//
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
//
// instead of
//
// import * as monaco from 'monaco-editor';
//
// because we are shipping only a subset of the languages.
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {createOnigScanner, createOnigString, loadWASM} from 'vscode-oniguruma';
import {SimpleLanguageInfoProvider} from './providers';
import {registerLanguages} from './register';
import {rehydrateRegexps} from './configuration';
import VsCodeDarkTheme from './vs-dark-plus-theme';
import VsCodeLightTheme from './vs-light-theme';
import {IRawTheme} from 'vscode-textmate';

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!');
}

interface DemoScopeNameInfo extends ScopeNameInfo {
  path: string;
}

main('gherkin');

async function main(language: LanguageId) {
  const themeKey = 'vs'; //'vs' -> Light; 'vs-dark' -> Dark
  const readOnly = true;

  const languages: monaco.languages.ILanguageExtensionPoint[] = [
    {
      id: 'gherkin',
      extensions: ['.feature'],
      aliases: ['Gherkin', 'feature'],
    },
  ];
  const grammars: {[scopeName: string]: DemoScopeNameInfo} = {
    'source.gherkin': {
      language: 'gherkin',
      path: 'Gherkin.tmLanguage.json',
    },
  };

  const fetchGrammar = async (scopeName: ScopeName): Promise<TextMateGrammar> => {
    const {path} = grammars[scopeName];
    const uri = `grammars/${path}`;
    const response = await fetch(uri);
    const grammar = await response.text();
    const type = path.endsWith('.json') ? 'json' : 'plist';
    return {type, grammar};
  };

  const fetchConfiguration = async (
    language: LanguageId,
  ): Promise<monaco.languages.LanguageConfiguration> => {
    const uri = `configurations/${language}.json`;
    const response = await fetch(uri);
    const rawConfiguration = await response.text();
    return rehydrateRegexps(rawConfiguration);
  };

  const data: ArrayBuffer | Response = await loadVSCodeOnigurumWASM();
  await loadWASM(data);
  const onigLib = Promise.resolve({
    createOnigScanner,
    createOnigString,
  });

  const provider = new SimpleLanguageInfoProvider({
    grammars,
    fetchGrammar,
    configurations: languages.map((language) => language.id),
    fetchConfiguration,
    theme: getTheme(themeKey),
    onigLib,
    monaco,
  });
  registerLanguages(
    languages,
    (language: LanguageId) => provider.fetchLanguageInfo(language),
    monaco,
  );

  const id = 'container';
  const element = document.getElementById(id);
  if (element == null) {
    throw Error(`could not find element #${id}`);
  }

  (window as any).editor = monaco.editor.create(element, {
    value: '',
    language,
    theme: themeKey,
    minimap: {
      enabled: true,
    },
    readOnly,
  });
  provider.injectCSS();
}

// Taken from https://github.com/microsoft/vscode/blob/829230a5a83768a3494ebbc61144e7cde9105c73/src/vs/workbench/services/textMate/browser/textMateService.ts#L33-L40
async function loadVSCodeOnigurumWASM(): Promise<Response | ArrayBuffer> {
  const response = await fetch(
    process.env.NODE_ENV === 'production'
      ? 'onig.wasm'
      : '/node_modules/vscode-oniguruma/release/onig.wasm');
  const contentType = response.headers.get('content-type');
  if (contentType === 'application/wasm') {
    return response;
  }

  // Using the response directly only works if the server sets the MIME type 'application/wasm'.
  // Otherwise, a TypeError is thrown when using the streaming compiler.
  // We therefore use the non-streaming compiler :(.
  return await response.arrayBuffer();
}

function getTheme(themeKey: string): IRawTheme {
  return themeKey == 'vs' ? VsCodeLightTheme : VsCodeDarkTheme;
}
