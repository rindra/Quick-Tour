const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [{
          loader: "html-loader",
          options: {
            minimize: true
          }
        }]
      },
      {
        "test": /\.js$/,
        "exclude": /node_modules/,
        "use": {
          "loader": "babel-loader",
          "options": {
            "presets": [
                            "@babel/preset-env"
                        ]
          }
        }
      },
      {
        "test": /\.less$/,
        "use": [
                    "style-loader",
                    "css-loader",
          "postcss-loader",
                    "less-loader",
                ]
      },
      {
        test: /\.(gif|png|svg|jpe?g)/i,
        use: [
          {
            loader: "url-loader",
            options: {
              name: "./img/[name].[ext]",
              limit: 10000
            }
          },
          {
            loader: "img-loader"
          }
        ]
      },
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: 'src/index.hbs'
    })
  ]
};
