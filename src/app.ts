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

const actions: any = require('monaco-editor/esm/vs/platform/actions/common/actions');

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

  const editor = monaco.editor.create(element, {
    value: '',
    language,
    theme: themeKey,
    minimap: {
      enabled: true,
    },
    readOnly,
    scrollBeyondLastLine: false,
    wordWrap: 'on'
  });
  provider.injectCSS();

  // disable opening command palette
  editor.onKeyDown(e => {
    if (e.keyCode === monaco.KeyCode.F1) {
      e.stopPropagation();
    }
  });

  // remove Command Palette from context menu
  let menus = actions.MenuRegistry._menuItems;
  let contextMenuEntry = [...menus].find((entry) => entry[0]._debugName == 'EditorContext');
  let contextMenuLinks = contextMenuEntry[1];

  let removableIds = ['editor.action.quickCommand'];

  let removeById = (list: any, ids: any) => {
    let node = list._first;
    do {
      let shouldRemove = ids.includes(node.element?.command?.id);
      if (shouldRemove) {
        list._remove(node);
      }
    } while ((node = node.next));
  };

  removeById(contextMenuLinks, removableIds);

  let cursorPosition: number;
  editor.onDidChangeCursorPosition(e => {
    cursorPosition = e.position.lineNumber;
  });

  const { grammar } = await fetchGrammar('source.gherkin');
  const featureKeywordRegex = new RegExp(JSON.parse(grammar).repository.feature_element_keyword.match);

  const scenarioTitles = () => {
    const ret: [number, string][] = [];
    const currentValue = editor.getValue();

    const lines = currentValue.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(featureKeywordRegex)) {
        ret.push([i + 1, line]);
      }
    }

    return ret;
  };

  const extractScenarioName = () => {
    const closestTitleToCursor = scenarioTitles()
        .map(([idx, line]) => [cursorPosition - idx, line])
        .filter(([distance]) => distance >= 0)
        // no need to sort, they already come in order
        .map(([, line]) => line)
        .pop() as string | undefined;

      if (!closestTitleToCursor) {
        // let the user know through gx they're an idiot
        return;
      }

      const matches = featureKeywordRegex.exec(closestTitleToCursor);
      return matches!![2].trim();
  }

  editor.addAction({
    id: 'gxreq-transaction-gen',
    label: 'Generate transaction',
    contextMenuGroupId: 'navigation',
    run: () => {
      console.log(extractScenarioName());
      (window.external as any).GenerateTransaction(extractScenarioName());
    },
  });

  editor.addAction({
    id: 'gxreq-test-gen',
    label: 'Generate procedure w/tests',
    contextMenuGroupId: 'navigation',
    run: () => {
      (window.external as any).GenerateProcedureWithTests(extractScenarioName());
    },
  });

  (window as any).editor = editor;
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
