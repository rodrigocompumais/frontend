const path = require('path');

module.exports = function override(config, env) {
  // Adicionar suporte para processar node_modules do reactflow
  const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
  
  if (oneOfRule) {
    // Encontrar os plugins
    const nullishPlugin = require.resolve('@babel/plugin-proposal-nullish-coalescing-operator');
    const optionalPlugin = require.resolve('@babel/plugin-proposal-optional-chaining');

    // Criar uma regra especÃ­fica para reactflow
    const reactflowRule = {
      test: /\.(js|jsx|mjs)$/,
      include: [
        path.resolve(__dirname, 'node_modules/@reactflow'),
        path.resolve(__dirname, 'node_modules/reactflow'),
      ],
      use: {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [
            require.resolve('babel-preset-react-app'),
          ],
          plugins: [
            nullishPlugin,
            optionalPlugin,
          ],
          cacheDirectory: true,
          cacheCompression: false,
          compact: false,
        },
      },
    };

    // Inserir no inÃ­cio do array oneOf para ter prioridade
    oneOfRule.oneOf.unshift(reactflowRule);
  }

  return config;
};