const pkg = require('./package');
import bodyParser from 'body-parser';
import session from 'express-session';
require('dotenv').config();

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: false,
  // loading: {
  //     name: 'chasing-dots',
  //     color: '#ff5638',
  //     background: 'white',
  //     height: '4px'
  // },

  /*
  ** Global CSS
  */
  css: [
    'static/css/appwork.css',
    'static/css/authentication.css',
    'static/css/theme-corporate.css',
    'static/css/colors.css',
    'static/css/uikit.css',
    'static/fonts/open-iconic.css',
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [

  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://bootstrap-vue.js.org/docs/
    ['bootstrap-vue/nuxt', {bootstrapCss: true}],
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
    // '@nuxtjs/auth',
    'nuxt-google-maps-module',
  ],

  maps: {
      key: process.env.GOOGLE_MAPS_KEY,
  },

  axios: {
      proxy: true,
      // proxyHeaders: false
  },

  proxy: {
      // '/api/': process.env.NODE_ENV === 'local' ? 'https://api.balena.ihost.net.ua/' : 'http://localhost:3000',
  },

  /*
  ** Build configuration
  */
  build: {
    watch: ['api', 'components', 'pages'],
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {

    }
  },
  hooks: {
    build: {
      done(builder) {
        if (!builder.nuxt.options.dev) {
          setTimeout(() => process.exit(0), 1000);
        }
      }
    }
  },
  serverMiddleware: [
    bodyParser.json(),
    // session middleware
    session({
        secret: 'asdWE324fSDas',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60000 }
    }),
    { path: '/api', handler: '~/api/index.js' },
    { path: '/ws', handler: '~/api/ws.js' },
  ]
}
