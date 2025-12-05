const path = require('path');

module.exports = function override(config, env) {
  // Adicionar suporte para processar node_modules do reactflow
  const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
  
  if (oneOfRule) {
    const babelLoaderIndex = oneOfRule.oneOf.findIndex(
      (loader) => loader.test && loader.test.toString().includes('jsx?')
    );

    if (babelLoaderIndex !== -1) {
      // Criar nova regra para reactflow antes da regra padrÃ£o
      oneOfRule.oneOf.splice(babelLoaderIndex, 0, {
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
            cacheDirectory: true,
            cacheCompression: false,
            compact: false,
          },
        },
      });
    }
  }

  return config;
};