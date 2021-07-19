import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {L} from './localization/translationProvider';

interface Snippet {
  label: string;
  kind: number;
  documentation: string;
  insertText: string;
  insertTextRules: number;
}

export const getSnippets = (): Snippet[] => [
  feature(),
  scenario(),
  table(0, 2),
  table(0, 3),
  table(0, 4),
  table(0, 5),
  table(0, 6),
  table(0, 7),
  table(1, 2),
  table(2, 3),
  table(3, 4),
  table(4, 5),
  table(5, 6),
  table(6, 7),
];

const feature = (): Snippet => {
  const lines = [
    `#${L('language')}: ${L('languagePrefix')}`,
    `\t${L('feature')}: \${1:${L('featureDescription')}}`,
    '',
    `\t${L('scenario')}: \${2:${L('scenarioDescription')}}`,
    `\t\t${L('given')} \${3:${L('context')}}`,
    `\t\t${L('when')} \${4:${L('condition')}}`,
    `\t\t${L('then')} \${5:${L('result')}}`,
  ];

  const documentation = L('featureDocumentation');

  return buildSnippet(L('feature'), documentation, lines);
};

const scenario = (): Snippet => {
  const lines = [
    `${L('scenario')}: \${1:${L('scenarioDescription')}}`,
    `\t${L('given')} \${2:${L('context')}}`,
    `\t${L('when')} \${3:${L('condition')}}`,
    `\t${L('then')} \${4:${L('result')}}`,
  ];
  const documentation = L('scenarioDocumentation');

  return buildSnippet(L('scenario'), documentation, lines);
};

const table = (itemRows: number, columns: number): Snippet => {
  const lines = [getHeader(columns), ...getItemRows(itemRows, columns)];

  const documentation = L('tableDocumentation');

  return buildSnippet(`${L('table')}${itemRows + 1}x${columns}`, documentation, lines);
};

const getHeader = (columns: number): string => {
  let header: string = '|';
  for (let i = 0; i < columns; i++) {
    header += ` \${${i + 1}:${L('head')}}  |`;
  }
  return header;
};

const getItemRows = (rows: number, columns: number): string[] => {
  const items: string[] = [];
  let item: string = '|';
  let position = columns + 1;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      item += ` \${${position}:${L('value')}}  |`;
      position++;
    }

    items.push(item);
    item = '|';
  }

  return items;
};

const buildSnippet = (label: string, documentation: string, lines: string[]): Snippet => {
  return {
    label,
    documentation,
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: lines.join('\n'),
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
  };
};
