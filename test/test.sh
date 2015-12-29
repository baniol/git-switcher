#!/bin/bash

tar xfz test/repo-test/git.tar.gz -C test/repo-test
node_modules/mocha/bin/mocha test
rm -fr test/repo-test/.git
rm test/repo-test/index.js
