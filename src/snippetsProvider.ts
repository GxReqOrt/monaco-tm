import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {L} from './localization/translationProvider';

interface Snippet {
  label: string;
  kind: number;
  documentation: string;
  insertText: string;
  insertTextRules: number;
}

export const getSnippets = async (): Promise<Snippet[]> => [
  await feature(),
  await scenario(),
  await table(0, 2),
  await table(0, 3),
  await table(0, 4),
  await table(0, 5),
  await table(0, 6),
  await table(0, 7),
  await table(1, 2),
  await table(2, 3),
  await table(3, 4),
  await table(4, 5),
  await table(5, 6),
  await table(6, 7),
];

const feature = async (): Promise<Snippet> => {
  const lines = [
    `#${await L('language')}: ${await L('languagePrefix')}`,
    `\t${await L('feature')}: \${1:${await L('featureDescription')}}`,
    '',
    `\t${await L('scenario')}: \${2:${await L('scenarioDescription')}}`,
    `\t\t${await L('given')} \${3:${await L('context')}}`,
    `\t\t${await L('when')} \${4:${await L('condition')}}`,
    `\t\t${await L('then')} \${5:${await L('result')}}`,
  ];

  const documentation = await L('featureDocumentation');

  return buildSnippet(await L('feature'), documentation, lines);
};

const scenario = async (): Promise<Snippet> => {
  const lines = [
    `${await L('scenario')}: \${1:${await L('scenarioDescription')}}`,
    `\t${await L('given')} \${2:${await L('context')}}`,
    `\t${await L('when')} \${3:${await L('condition')}}`,
    `\t${await L('then')} \${4:${await L('result')}}`,
  ];
  const documentation = await L('scenarioDocumentation');

  return buildSnippet(await L('scenario'), documentation, lines);
};

const table = async (itemRows: number, columns: number): Promise<Snippet> => {
  const lines = [await getHeader(columns), ... await getItemRows(itemRows, columns)];

  const documentation = await L('tableDocumentation');

  return buildSnippet(`${await L('table')}${itemRows + 1}x${columns}`, documentation, lines);
};

const getHeader = async (columns: number): Promise<string> => {
  let header: string = '|';
  for (let i = 0; i < columns; i++) {
    header += ` \${${i + 1}:${await L('head')}}   |`;
  }
  return header;
};

const getItemRows = async (rows: number, columns: number): Promise<string[]> => {
  const items: string[] = [];
  let item: string = '|';
  let position = columns + 1;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      item += ` \${${position}:${await L('value')}}  |`;
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
