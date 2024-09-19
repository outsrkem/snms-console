const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/snms/',
  devServer: {
        proxy: {
          '/': {
            target: 'http://10.10.10.14:8080',
            changeOrigin: true,
            secure: false,
            pathRewrite: {
              '^/snms': '/snms'
            }
          }
        },
        webSocketServer: false,
    },

    productionSourceMap: false,
})
