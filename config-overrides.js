module.exports = {
    // Workaround for this issue: https://github.com/polkadot-js/common/issues/900
    webpack: function(config) {
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto"
        });
        return config;
    },

    jest: function(config) {
        config.transformIgnorePatterns = [
            "/node_modules/(?!(@polkadot|@babel)/).*",
        ];
        return config;
    },
}
