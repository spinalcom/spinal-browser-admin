var fs = require("fs");
var path = require("path");
var browserify = require("browserify");
var exorcist = require("exorcist");
var watchify = require("watchify");

var program = require("commander");
var input = null;
var output;
var outputPath = "";

program
  .version("1.0.0")
  .arguments("<src> [srcs...]")
  .action(function(src, srcs) {
    input = [src];
    if (srcs && srcs.length > 0) {
      input = input.concat(srcs);
    }
  })
  .option("-w, --watcher", "Add watcher")
  .option("-o, --output <filename>", "set the output file.")
  .parse(process.argv);

if (!input) {
  program.help();
}
if (program.output) {
  outputPath = path.resolve(program.output);
}

var b;

function compile() {
  if (program.watcher) {
    b = browserify({
      entries: input,
      cache: {},
      packageCache: {},
      debug: true,
      plugin: [watchify]
    });
    b.on("update", bundle);
    bundle();
  } else {
    b = browserify({
      entries: input,
      debug: true
    });
    bundle();
  }
}

function bundle() {
  console.log("bundle");
  if (program.output) {
    outputPath = path.resolve(program.output);
    output = fs.createWriteStream(outputPath);
  }
  b
    .transform("babelify", {
      global: true,
      presets: ["es2015"]
    })
    .transform("windowify", {
      global: true
    })
    .transform("uglifyify", {
      global: true,
      mangle: {
        keep_fnames: true
      }
    })
    .bundle()
    .pipe(exorcist(outputPath + ".map"))
    .pipe(output);
  if (program.watcher) {
    output.on("finish", function() {
      console.log("compile DONE in " + outputPath);
    });
  }
}

compile();
