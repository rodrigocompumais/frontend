const path = require('path');

function override(config, env) {
  const oneOfRule = config.module.rules.find((rule) => rule.oneOf);

  if (oneOfRule) {
    const nullishPlugin = require.resolve('@babel/plugin-proposal-nullish-coalescing-operator');
    const optionalPlugin = require.resolve('@babel/plugin-proposal-optional-chaining');

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

    oneOfRule.oneOf.unshift(reactflowRule);
  }

  return config;
}

override.paths = (paths) => {
  if (process.env.BUILD_STAGING === '1') {
    paths.appBuild = path.resolve(__dirname, 'build-staging');
  }
  return paths;
};

module.exports = override;
