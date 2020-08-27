module.exports = {
    presets: [
      [
        "@babel/preset-env", {
          "useBuiltIns": "entry",
          "corejs": 3,
          "targets": {
            "electron": 9
          }
        }],
      '@babel/preset-react',
      '@babel/preset-typescript'
    ]
  }