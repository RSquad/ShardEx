/* eslint-disable @typescript-eslint/no-var-requires */
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
// const RemovePlugin = require("remove-files-webpack-plugin");

module.exports = {
  transpileDependencies: ["vuetify", "vuex-persist"],
  configureWebpack: {
    plugins: [
      new CopyPlugin([
        {
          from: path.join(__dirname, "./node_modules/@tonclient/lib-web/tonclient.wasm"),
          to: path.join(__dirname, "public"),
          toType: "dir",
        },
      ]),
    ],
    output: {
      filename: "js/[name].js",
      chunkFilename: "js/[name].js",
    },
  },
  chainWebpack: (config) => {
    config.optimization.delete("splitChunks");
  },
  pages: {
    popup: {
      template: "public/popup.html",
      entry: "./src/popup/main.ts",
    },
    standalone: {
      template: "public/index.html",
      entry: "./src/standalone/main.ts",
      filename: "index.html",
    },
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: "src/background.ts",
        },
      },
    },
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: false,
      enableBridge: false,
    },
  },
};
