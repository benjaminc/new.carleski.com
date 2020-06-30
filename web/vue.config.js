module.exports = {
  pages: {
    'index': 'src/pages/Home/main.js',
    'list': 'src/pages/List/main.js',
    'detail': 'src/pages/Detail/main.js'
  },
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
}