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
            var testPath = path.resolve(path.join(__dirname, '../test/repo-test'));
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
    describe('Get Repo Info', function () {
        it('should return branches, current branch and latest log info', function (done) {
            git.getRepoInfo('Repo 1').then(data => {
                //console.log(data[0][0]);
                assert.equal(data[0][0], '  branch_1');
                assert.equal(data[1], 'On branch master');
                assert.equal(data[2], '14de4a8 first commit\n');
                done();
            });
        });
    });
    describe('Run hooks', function () {
        it('should return first hook output', function (done) {
            var hooks = git.execHooks('Repo 1');
            hooks[0].then(data => {
                assert.equal(data.trim(), 'test string');
                done();
            });
        });
    });
    describe('Checkout', function () {
        it('should return checked out branch info', function (done) {
            var p = git.checkout('Repo 1', 'branch_1');
            p.then(data => {
                //assert.isArray(data);
                assert.equal(data[0], 'On branch branch_1');
                assert.equal(data[1], '14de4a8 first commit\n');
                assert.equal(data[2], 'test string\n');
                done();
            });
        });
    });
});
