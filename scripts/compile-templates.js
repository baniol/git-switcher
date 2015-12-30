var path = require('path');
var fs = require('fs');
var recursive = require('recursive-readdir');
var watch = require('watch');

var templateDir = path.resolve(path.join(__dirname, '..', 'public/templates'));
var buildDir = path.join(__dirname, '..', 'public/javascripts');

var fileObject = {};

if (process.argv[2] === 'compile') {
  compileTemplates();
}
else {
  watcher();
}

function compileTemplates() {
  readTemplates();
  writeTemplates();
}

function watcher() {
  readTemplates();
  watchTemplates();
}

function watchTemplates() {
  watch.watchTree(templateDir, function (f, curr, prev) {
    if (typeof f == "object" && prev === null && curr === null) {
      // Finished walking the tree
    } else if (prev === null) {
      // f is a new file
      saveTemplate(f);
      writeTemplates();
    } else if (curr.nlink === 0) {
      // f was removed
      removeTemplate(f);
    } else {
      // f was changed
      saveTemplate(f);
      writeTemplates();
    }
  });
}

function readTemplates () {
  recursive(templateDir, function (err, files) {
    if (err) {
      return reject(err);
    }
    readFiles(files);
  });
}

function readFiles(files) {
  files.forEach(function (file) {
    saveTemplate(file);
  });
  writeTemplates();
}

function saveTemplate(file) {
  var fileName = path.relative(templateDir, file);
  var contents = fs.readFileSync(file, 'utf8');
  fileObject[fileName] = contents;
  console.log('Template ' + fileName + ' saved');
}

function removeTemplate (f) {
  var fileName = path.relative(templateDir, file);
  delete fileObject[fileName];
  console.log('Template ' + fileName + ' removed');
}

function writeTemplates() {
  var contents = 'App.templates=' + JSON.stringify(fileObject);
  fs.writeFile(path.join(buildDir, 'templates.js'), contents);
}