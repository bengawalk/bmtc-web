import webpack from "webpack";
import path from "node:path";

const commonConfig = {
  entry: {
    main: './src/index.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
          'postcss-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    publicPath: "/",
    path: path.join(process.cwd(), 'dist'),
  },
  plugins:[
    new webpack.DefinePlugin({
      MAPBOX_TOKEN: JSON.stringify(process.env.MAPBOX_TOKEN),
    })
  ],
};

export default commonConfig;
