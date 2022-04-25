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

            config.plugins.push(
                new webpack.ProvidePlugin({
                    process: 'process/browser.js',
                    Buffer: ['buffer', 'Buffer']
                }),
            );

			return config;
		}
    }
};
