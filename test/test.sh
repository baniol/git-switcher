#!/bin/bash

tar xfz test/tepo-test/git.tar.gz -C test/repo-test
node_modules/mocha/bin/mocha test