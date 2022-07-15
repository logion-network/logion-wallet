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
