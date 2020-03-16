const makeUglify = require('./make-uglify');

makeUglify('dist/global/experimental.esnext.umd.js', {
  compress: {
    inline: false
  },
});
