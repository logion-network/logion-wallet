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
        config.collectCoverageFrom = [
            "**/*.{ts,tsx}",
            "**/*.{js,jsx}",
            "!<rootDir>/src/index.tsx",
            "!<rootDir>/src/tests.tsx",
            "!<rootDir>/src/react-app-env.d.ts",
            "!<rootDir>/src/reportWebVitals.ts"
        ];
        config.coverageThreshold = {
            global: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: -10 // -N = more than N uncovered statements
            }
        };
        return config;
    },
}
