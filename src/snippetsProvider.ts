import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {L} from './localization/translationProvider';

interface Snippet {
  label: string;
  kind: number;
  documentation: string;
  insertText: string;
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
    `\t${L('feature')}: ${L('featureDescription')}`,
    '',
    `\t${L('scenario')}: ${L('scenarioDescription')}`,
    `\t\t${L('given')} ${L('context')}`,
    `\t\t${L('when')} ${L('condition')}`,
    `\t\t${L('then')} ${L('result')}`,
  ];

  const documentation = L('featureDocumentation');

  return buildSnippet(L('feature'), documentation, lines);
};

const scenario = (): Snippet => {
  const lines = [
    `${L('scenario')}: ${L('scenarioDescription')}`,
    `\t${L('given')} ${L('context')}`,
    `\t${L('when')} ${L('condition')}`,
    `\t${L('then')} ${L('result')}`,
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
  return '|' + ` ${L('head')}  |`.repeat(columns);
};

const getItemRows = (rows: number, columns: number): string[] => {
  const row = getItemRow(columns);
  return [...Array(rows)].map(() => row);
};

const getItemRow = (columns: number): string => {
  return '|' + ` ${L('value')} |`.repeat(columns);
};

const buildSnippet = (label: string, documentation: string, lines: string[]): Snippet => {
  return {
    label,
    documentation,
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: lines.join('\n'),
  };
};
