const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/snms/',
  devServer: {
        proxy: {
          '/': {
            target: 'https://uias-develop.local.outsrkem.top:52105/',
            changeOrigin: true,
            secure: false,
            pathRewrite: {
              '^/': '/'
            }
          },
        },
        webSocketServer: false,
    },

    productionSourceMap: false,
})
