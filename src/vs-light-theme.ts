export default {
  name: 'Light',
  settings: [
    {
      settings: {
        foreground: '#000000',
        background: '#FFFFFF',
      },
    },
    {
      name: 'Variable and parameter name',
      scope: [
        'variable',
        'meta.definition.variable.name',
        'support.variable',
        'entity.name.variable',
      ],
      settings: {
        foreground: '#0000ff',
      },
    },
    {
      scope: 'constant.character',
      settings: {
        foreground: '#0000ff',
      },
    },
    {
      scope: 'emphasis',
      settings: {
        fontStyle: 'italic',
      },
    },
    {
      scope: 'strong',
      settings: {
        fontStyle: 'bold',
      },
    },
    {
      scope: 'header',
      settings: {
        foreground: '#000080',
      },
    },
    {
      scope: 'comment',
      settings: {
        foreground: '#008000',
      },
    },
    {
      scope: 'constant.language',
      settings: {
        foreground: '#0000ff',
      },
    },
    {
      scope: 'entity.other.attribute-name',
      settings: {
        foreground: '#0000ff',
      },
    },
    {
      scope: 'invalid',
      settings: {
        foreground: '#f44747',
      },
    },
    {
      scope: ['meta.preprocessor', 'entity.name.function.preprocessor'],
      settings: {
        foreground: '#0000ff',
      },
    },
    {
      scope: 'meta.preprocessor.string',
      settings: {
        foreground: '#a31515',
      },
    },
    {
      scope: ['string', 'entity.name.operator.custom-literal.string', 'meta.embedded.assembly'],
      settings: {
        foreground: '#a31515',
      },
    },
    {
      scope: 'string.tag',
      settings: {
        foreground: '#a31515',
      },
    },
    {
      scope: 'string.value',
      settings: {
        foreground: '#a31515',
      },
    },
    {
      name: 'String interpolation',
      scope: [
        'punctuation.definition.template-expression.begin',
        'punctuation.definition.template-expression.end',
        'punctuation.section.embedded',
      ],
      settings: {
        foreground: '#0000ff',
      },
    },
    {
      scope: 'keyword',
      settings: {
        foreground: '#0000ff',
      },
    },
  ],
};
