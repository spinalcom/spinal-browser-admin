var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var exorcist = require('exorcist');
var b = browserify({
  debug: true
});

var program = require('commander');
var input = null;
var output = process.stdout; // default
var outputPath = "";

program
  .version('1.0.0')
  .arguments('<src> [srcs...]')
  .action(function (src, srcs) {
    input = [src];
    if (srcs && srcs.length > 0) {
      input = input.concat(srcs);
    }
  })
  .option('-o, --output <filename>', 'set the output file.')
  .parse(process.argv);

if (!input) {
  program.help();
}
if (program.output) {
  outputPath = path.resolve(program.output);
  output = fs.createWriteStream(outputPath);
}
input.forEach(element => {
  b.add(element);
});
b.transform("babelify", {
    global: true,
    presets: ["es2015"],
  })
  .transform("windowify", {
    global: true,
  })
  .transform("uglifyify", {
    global: true,
    mangle: {
      keep_fnames: true
    }
  });
if (outputPath != "") {
  let bundle = b.bundle()
    .pipe(exorcist(outputPath + '.map'))
    .pipe(output);
} else {
  b.bundle().pipe(output);
}