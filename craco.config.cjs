const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: (config) => {
            if(config.resolve.fallback === undefined) {
                config.resolve.fallback = {};
            }
            config.resolve.fallback.buffer = require.resolve('buffer');
            config.resolve.fallback.process = require.resolve('process/browser');
            config.resolve.fallback.stream = require.resolve('stream-browserify');
            config.resolve.fallback.util = require.resolve('text-encoding');
            config.resolve.fallback.fs = false;
            config.resolve.fallback.crypto = require.resolve('crypto-browserify');
            config.resolve.fallback.http = require.resolve('stream-http');
            config.resolve.fallback.https = require.resolve('https-browserify');
            config.resolve.fallback.assert = require.resolve('assert/');
            config.resolve.fallback.url = require.resolve('url/');
            config.resolve.fallback.os = require.resolve('os-browserify/browser');

            config.plugins.push(
                new webpack.ProvidePlugin({
                    process: 'process/browser.js',
                    Buffer: ['buffer', 'Buffer']
                }),
            );

            const fileLoaderRule = getFileLoaderRule(config.module.rules);
            if(!fileLoaderRule) {
                throw new Error("File loader not found");
            }
            fileLoaderRule.exclude.push(/\.cjs$/);

			return config;
		}
    },
    jest: {
        configure: (config) => {
            config.transformIgnorePatterns = [
                "/node_modules/(?!(@polkadot|@babel|react-calendar|react-date-picker|pagedjs|@creativecommons|@logion)/).*"
            ];

            delete config.transform['^.+\\.(js|jsx|mjs|cjs|ts|tsx)$'];
            config.transform["\\.[jt]sx?$"] = "babel-jest";

            return config;
        }
    }
};

function getFileLoaderRule(rules) {
    for(const rule of rules) {
        if("oneOf" in rule) {
            const found = getFileLoaderRule(rule.oneOf);
            if(found) {
                return found;
            }
        } else if(rule.test === undefined && rule.type === 'asset/resource') {
            return rule;
        }
    }
}
