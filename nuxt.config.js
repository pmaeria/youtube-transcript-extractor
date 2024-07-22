export default {
  server: {
    host: '0.0.0.0'
  },
  nitro: {
    routeRules: {
      '/api/**': { cors: true },
    },
  },
}

