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
    const uri = `/grammars/${path}`;
    const response = await fetch(uri);
    const grammar = await response.text();
    const type = path.endsWith('.json') ? 'json' : 'plist';
    return {type, grammar};
  };

  const fetchConfiguration = async (
    language: LanguageId,
  ): Promise<monaco.languages.LanguageConfiguration> => {
    const uri = `/configurations/${language}.json`;
    const response = await fetch(uri);
    const rawConfiguration = await response.text();
    return rehydrateRegexps(rawConfiguration);
  };

  const data: ArrayBuffer | Response = await loadVSCodeOnigurumWASM();
  loadWASM(data);
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

  const value = getSampleCodeForLanguage(language);
  const id = 'container';
  const element = document.getElementById(id);
  if (element == null) {
    throw Error(`could not find element #${id}`);
  }

  monaco.editor.create(element, {
    value,
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
  const response = await fetch('/onig.wasm');
  const contentType = response.headers.get('content-type');
  if (contentType === 'application/wasm') {
    return response;
  }

  // Using the response directly only works if the server sets the MIME type 'application/wasm'.
  // Otherwise, a TypeError is thrown when using the streaming compiler.
  // We therefore use the non-streaming compiler :(.
  return await response.arrayBuffer();
}

function getSampleCodeForLanguage(language: LanguageId): string {
  if (language === 'gherkin') {
    return `#language: en

    Feature: Subscribers see different sets of stock images based on their subscription level 
    
    Scenario: Free subscribers see only the free articles
      Given users with a free subscription can access "FreeArticle1" but not "PaidArticle1" 
      When I type "freeFrieda@example.com" in the email field
      And I type "validPassword123" in the password field
      And I press the "Submit" button
      Then I see "FreeArticle1" on the home page
      And I do not see "PaidArticle1" on the home page
    
    Scenario: Subscriber with a paid subscription can access "FreeArticle1" and "PaidArticle1"
      Given I am on the login page
      When I type "paidPattya@example.com" in the email field
      And I type "validPassword123" in the password field
      And I press the "Submit" button
      Then I see "FreeArticle1" and "PaidArticle1" on the home page
      
      
#language: es

  Característica: Alta usuario

  Escenario: Datos del usuario correctos
    Dado que el administrador quiere crear un usuario con los siguientes datos
  
      | ID          | Name      | Lastname  | Age | Country of Birth | Date of Birth      | 
      | 4.885.371.8 | Guillermo | Churchill | 32  | Inglaterra       | 10-10-1989         | 
      | 2.124.666.1 | Felipe    | Thatcher  | 99  | Grecia           | 09-08-1921         |  
  
     Cuando el administrador ingresa los datos requeridos
  
      | ID | Name | Lastname | 
  
     Entonces el sistema no muestra error y el usuario se da de alta de forma correcta.
  
  Escenario: Datos requeridos faltantes
    Dado que el administrador quiere crear un usuario con los siguientes datos
  
      | ID          | Name      | Lastname  | Age | Country of Birth | Date of Birth      | 
      | 4.885.371.8 | Guillermo | Churchill | 32  | Inglaterra       | 10-10-1989         | 
      | 2.124.666.1 | Felipe    | Thatcher  | 99  | Grecia           | 09-08-1921         | 
  
     Cuando el administrador ingresa los siguientes datos
  
      | Name | Lastname | 
  
     Entonces el sistema indica que existe un error. Indica que el campo CI es requerido.
  
  Escenario: Valor de CI de usuario repetido
    Dado que el administrador quiere crear un usuario con los siguientes datos
  
      | ID          | Name      | Lastname  | Age | Country of Birth | Date of Birth      | 
      | 4.885.371.8 | Guillermo | Churchill | 32  | Inglaterra       | 10-10-1989         | 
      | 4.885.371.8 | Felipe    | Thatcher  | 99  | Grecia           | 09-08-1921         | 
  
     Cuando el administrador ingresa los siguientes datos
  
      | ID | Name | Lastname | 
  
     Entonces el sistema muestra un error. Indica que ya existe un usuario registrado con esa CI.
`;
  }

  throw Error(`unsupported language: ${language}`);
}

function getTheme(themeKey: string): IRawTheme {
  return themeKey == 'vs' ? VsCodeLightTheme : VsCodeDarkTheme;
}
