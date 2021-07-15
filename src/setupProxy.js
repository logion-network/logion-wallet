const { createProxyMiddleware } = require('http-proxy-middleware');

function target() {
    const envTarget = process.env["REACT_APP_SERVICE_URL"];
    if(envTarget !== undefined) {
        return envTarget;
    } else {
        return 'https://dev.logion.network';
    }
}

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: target(),
            changeOrigin: true,
            secure: false,
        })
    );
};
