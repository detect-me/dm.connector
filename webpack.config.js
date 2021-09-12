const fs = require('fs');
const path = require('path');

const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const appDirectory = fs.realpathSync(process.cwd());
const imageInlineSizeLimit = 10000;

module.exports = (_, { mode: webpackEnv }) => {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  return {
    target: ['browserslist'],
    mode: webpackEnv,
    bail: isEnvProduction,
    devtool: isEnvDevelopment ? 'cheap-module-source-map' : false,
    entry: path.resolve(appDirectory, 'src/index.js'),
    output: {
      path: path.resolve(appDirectory, 'dist'),
      pathinfo: isEnvDevelopment,
      filename: 'app.js',
      assetModuleFilename: 'static/media/[name].[ext]',
    },
    infrastructureLogging: {
      level: 'none',
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            keep_classnames: false,
            keep_fnames: false,
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
    },
    resolve: {
      modules: ['node_modules'],
    },
    devServer: isEnvDevelopment
      ? ({
        compress: true,
        port: 8080,
        client: {
          overlay: true,
        },
        host: '0.0.0.0',
      }) : undefined,
    module: {
      strictExportPresence: true,
      rules: [
        isEnvDevelopment && ({
          enforce: 'pre',
          exclude: /@babel(?:\/|\\{1,2})runtime/,
          test: /\.(js|mjs|jsx|ts|tsx|css)$/,
          use: 'source-map-loader',
        }),
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: imageInlineSizeLimit,
            },
          },
        },
        {
          test: /\.js$/,
          include: path.resolve(appDirectory, 'src'),
          loader: require.resolve('babel-loader'),
          options: {
            customize: require.resolve(
              'babel-preset-react-app/webpack-overrides',
            ),
            presets: [[require.resolve('babel-preset-react-app')]],
            babelrc: false,
            configFile: false,
            cacheDirectory: true,
            cacheCompression: false,
            compact: isEnvProduction,
          },
        },
        {
          test: /\.(js|mjs)$/,
          exclude: /@babel(?:\/|\\{1,2})runtime/,
          loader: require.resolve('babel-loader'),
          options: {
            babelrc: false,
            configFile: false,
            compact: false,
            presets: [
              [
                require.resolve('babel-preset-react-app/dependencies'),
                { helpers: true },
              ],
            ],
            cacheCompression: false,
            sourceMaps: isEnvDevelopment,
            inputSourceMap: isEnvDevelopment,
          },
        },
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: [
            isEnvDevelopment && require.resolve('style-loader'),
            isEnvProduction && ({
              loader: MiniCssExtractPlugin.loader,
            }),
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
                sourceMap: isEnvProduction,
                modules: { mode: 'icss' },
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                postcssOptions: {
                  ident: 'postcss',
                  plugins: [
                    'postcss-flexbugs-fixes',
                    [
                      'postcss-preset-env',
                      {
                        autoprefixer: {
                          flexbox: 'no-2009',
                        },
                        stage: 3,
                      },
                    ],
                  ],
                },
                sourceMap: isEnvDevelopment,
              },
            },
          ].filter(Boolean),
          sideEffects: true,
        },
      ].filter(Boolean),
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: 'head',
        template: path.resolve(appDirectory, 'src/index.html'),
        minify: false,
        scriptLoading: 'blocking',
      }),
      new CopyPlugin({
        patterns: [
          { from: path.resolve(appDirectory, 'src/favicons'), to: 'favicons' },
        ],
      }),
      new ModuleNotFoundPlugin(path.resolve(appDirectory, 'src')),
      isEnvDevelopment && new CaseSensitivePathsPlugin(),
      isEnvProduction && (
        new MiniCssExtractPlugin({
          filename: 'css/[name].css',
        })
      ),
      isEnvProduction && new CleanWebpackPlugin(),
    ].filter(Boolean),
    performance: false,
  };
};
