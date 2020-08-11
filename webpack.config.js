const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "production", // "production" | "development" | "none"
  // Chosen mode tells webpack to use its built-in optimizations accordingly.
  entry: "./src/index.js",
  output: {
    // options related to how webpack emits results
    path: path.resolve(__dirname, "build"), // string
    // the target directory for all output files
    // must be an absolute path (use the Node.js path module)
    filename: "static/js/main.js", // string
    // the filename template for entry chunks
    publicPath: "/", // string
    // the url to the output directory resolved relative to the HTML page
    library: "Indoorphins.js", // string,
    // the name of the exported library
    libraryTarget: "umd", // universal module definition
    // the type of the exported library
    /* Advanced output configuration (click to show) */
    /* Expert output configuration (on own risk) */
  },
  target: "web",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      parallel: true,
    })],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public/img/', to: 'static/img/' },
        { from: 'public/PP.html', to: 'PP.html' },
        { from: 'public/TOS.html', to: 'TOS.html' },
        { from: 'public/robots.txt', to: 'robots.txt' },
      ],
    }),
    new CompressionPlugin({
      filename: '[path]',
    }),
    new HtmlWebpackPlugin({
      title: "Indoorphins",
      scriptLoading: 'defer', 
      favicon: "public/favicon.ico",
      minify: true,
      meta: {
        "Indoorphins.fit": {
          name: "Indoorphins.fit",
          content: "Video connection platform for Fitness Instructors and Participants"
        },
        viewport: {
          name:"viewport",
          content:"width=device-width, initial-scale=1" 
        }
      },
      inject: false,
      templateContent: ({htmlWebpackPlugin}) => `
        <!DOCTYPE html>
        <html>
          <head>
            <script src="/config.js"></script>
            <meta charset="utf-8"/>
            <title>${htmlWebpackPlugin.options.title}</title>
            ${htmlWebpackPlugin.tags.headTags}
          </head>
          <body>
            <div id="root"></div>
            ${htmlWebpackPlugin.tags.bodyTags}
          </body>
        </html>
      `
    })
  ]
}