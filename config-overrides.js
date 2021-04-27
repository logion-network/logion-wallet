// Workaround for this issue: https://github.com/polkadot-js/common/issues/900
module.exports = function override(webpackConfig) {
    webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
    });

  return webpackConfig;
}