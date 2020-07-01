module.exports = {
    chainWebpack: (config) => {
      const svgRule = config.module.rule('svg')
   
      svgRule.uses.clear()
   
      svgRule
        .use('babel-loader')
        .loader('babel-loader')
        .end()
        .use('vue-svg-loader')
        .loader('vue-svg-loader')
    },
    pwa: {
      name: "Chore Chart",
      themeColor: "#008000",
      msTileColor: "#404040",
      appleMobileWebAppCapable: 'yes',
      manifestPath: "site.webmanifest",
      manifestOptions: {
        name: "Carleski Family Chore Chart",
        background_color: "#ffffff",
        start_url: '/'
      },
      iconPaths: {
        favicon32: '/img/favicon-32x32.png',
        favicon16: '/img/favicon-16x16.png',
        appleTouchIcon: '/img/apple-touch-icon.png',
        maskIcon: '/img/maskable_icon.png',
        msTileImage: '/img/android-chrome-192x192.png'
      }
    }
  }