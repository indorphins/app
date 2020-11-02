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
    filename: `static/js/main.${new Date().getTime()}.js`, // string
    // the filename template for entry chunks
    publicPath: "/", // string
    // the url to the output directory resolved relatve to the HTML page
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
      },
      {
        test: /\.(woff2|ttf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      parallel: true,
    })],
  },
  plugins: [
    new CompressionPlugin({
      filename: '[path]',
      include: /\/*.js/
    }),
    new CopyPlugin({
      patterns: [
        { from: 'public/img/', to: 'img/' },
        { from: 'public/PP.html', to: 'PP.html' },
        { from: 'public/TOS.html', to: 'TOS.html' },
        { from: 'public/robots.txt', to: 'robots.txt' },
      ],
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
            <!-- Facebook Pixel Code -->
            <script>
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '669417420422806');
              fbq('track', 'PageView');
            </script>
            <noscript><img height="1" width="1" style="display:none"
              src="https://www.facebook.com/tr?id=669417420422806&ev=PageView&noscript=1"
            /></noscript>
            <!-- End Facebook Pixel Code -->
            <script async src="https://www.googletagmanager.com/gtag/js"></script>
            <script>
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
        
              gtag('config', appConfig.googleAnalytics, {
                'send_page_view': false
              });
            </script>
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