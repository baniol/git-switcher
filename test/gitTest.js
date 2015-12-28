var assert = require('assert');
var path = require('path');

var git = require('../libs/git');
var config = require('./config');

describe('Git module tests', function () {
    beforeEach(function () {
        git.init(config, true);
    });
    describe('Get repos list function', function () {
        it('should return an array', function (done) {
            var repos = git.getRepos(config);
            assert(Array.isArray(repos));
            assert(repos[0] === 'Repo 1');
            assert(repos[1] === 'Repo 2');
            done();
        });
    });
    describe('Get path to the repository with existing repo name', function () {
        it('should return the correct path', function () {
            var repoPath = git.getPath('Repo 1');
            var testPath = path.resolve(path.join(__dirname, '../test/test-repo'));
            assert.strictEqual(repoPath, testPath);
        });
    });
    describe('Get error with non-existing repo name', function () {
        it('should return the error object', function () {
            var repoPath = git.getPath('Repo x');
            assert.equal(repoPath.error, 'No repo directory!');
        });
    });
    describe('Get branches for a repo', function () {
        it('should return an array with branches', function (done) {
            git.getBranches('Repo 1').then(branches => {
                assert(Array.isArray(branches));
                done();
            });
        });
        it('first branch should be branch_1, second branch_2, third * master', function (done) {
            git.getBranches('Repo 1').then(branches => {
                //console.log(branches)
                assert.equal(branches[0], '  branch_1');
                assert.equal(branches[1], '  branch_2');
                assert.equal(branches[2], '* master');
                done();
            });
        });
    });
    describe('Get branches for non existing repo', function () {
        it('should return an error', function (done) {
            git.getBranches('Repo 2')
                .catch(err => {
                    assert.equal(err.code, 128);
                    done();
                });
        });
    });
    describe('Get current branch name', function () {
        it('should return the first line of the branch status', function (done) {
            git.getCurrentBranch('Repo 1').then(info => {
                assert.equal(info, 'On branch master');
                done();
            });
        });
    });
    describe('Get log', function () {
        it('should return latest git log', function (done) {
            git.getLatestLog('Repo 1').then(info => {
                assert.equal(info, '14de4a8 first commit\n');
                done();
            });
        });
    });
});
