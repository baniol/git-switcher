var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

var git = exports = module.exports = {};

/**
 * Itinialize git module
 * @param {object} reposConfig  JSON object with repository details
 * @param {bool|undefined} test Set to true if invoked from unit test.
 */
git.init = function(reposConfig, test) {
  this.remote = !test;
  this.reposConfig = reposConfig;
};

/**
 * Return names of the repositories from the config file
 * @return {array} Keys with repository names
 */
git.getRepos = function() {
  return Object.keys(this.reposConfig);
};

/**
 * @param {string} repoName   Name of the repository
 * @return {string} Absolute path to the repository
 */
git.getPath = function(repoName) {
  var repoPath;
  if(this.reposConfig[repoName] && this.reposConfig[repoName].path) {
    repoPath = path.resolve(this.reposConfig[repoName].path);
  }
  else {
    repoPath = {error: 'No repo directory!'};
  }
  return repoPath;
};

/**
 * @param {string} repoName   Name of the repository
 * @return {array} Array with cli commands to execute after switching branch
 */
git.getHooks = function(repoName) {
  var hooks;
  if(this.reposConfig[repoName] && Array.isArray(this.reposConfig[repoName].hooks)) {
    hooks = this.reposConfig[repoName].hooks;
  }
  else {
    hooks = {error: 'No hooks for this repo!'};
  }
  return hooks;
};

/**
 * Get branch related info:
 *  - all remote branches
 *  - current branch
 *  - latest log info
 * @param {string} repoName Name of the repository
 * @param {function} fn Callback function
 * @return {promise}
 */
git.getRepoInfo = function (repoName) {
  return Promise.all([
            this.getBranches(repoName),
            this.getCurrentBranch(repoName),
            this.getLatestLog(repoName)
        ]);
};

/**
 * Get all remote branches
 * @return {promise}
 */
git.getBranches = function (repoName) {
  var remote = this.remote ? '-r' : '';
  var path = this.getPath(repoName);
  var cmd = `GIT_DIR="${path}/.git" git branch ${remote}`;
  var modifier = function (output) {
    var p = output.split('\n');
    p = p.filter(function (item) {
      return item !== '' && !/origin\/HEAD/.test(item) && item !== 'Fetching origin';
    });
    return p;
  };
  return _promisify(cmd, modifier);
};

/**
 * Get current branch
 * @return {promise}
 */
git.getCurrentBranch = function (repoName) {
  var path = this.getPath(repoName);
  var cmd = `GIT_DIR="${path}/.git" git status`;
  var modifier = function (input) {
    return input.split('\n')[0];
  };
  return _promisify(cmd, modifier);
};

/**
 * Get latest log info
 * @return {promise}
 */
git.getLatestLog = function (repoName) {
  var path = this.getPath(repoName);
  var cmd = `GIT_DIR="${path}/.git" git log -1 --oneline`;
  return _promisify(cmd);
};

/**
 * Check out to the desired branch and get the branch info
 * @TODO too complicated flow - break into simpler methods
 * @param {string} repoName Name of the repository
 * @param {string} branch Target branch name
 * @return {promise}
 */
git.checkout = function (repoName, branch) {
  branch = branch.trim();
  var self = this;
  var path = this.getPath(repoName);

  var cmd = `GIT_DIR="${path}/.git" git checkout -f ${branch}`;
  try {
    fs.accessSync(path, fs.R_OK);
  }
  catch (e) {
    // @TODO not very elegant
    return new Promise((resolve, reject) => reject('Repo directory does not exist!'));
  }
  return _promisify(cmd).then(() => {
        var promiseArray = [
          self.getCurrentBranch(repoName),
          self.getLatestLog(repoName)
        ];
        var hookArray = self.execHooks(repoName);
        var out = promiseArray.concat(hookArray);
        return Promise.all(out);
      });
};

/**
 * Executes post checkout hooks
 * @param {string} repoName Name of the repository
 * @return {array} Array of promises
 */
git.execHooks = function (repoName) {
  var hooks = this.getHooks(repoName);
  var promiseArray = [];
  hooks.forEach(function (action) {
    promiseArray.push(_promisify(action));
  });
  return promiseArray;
};

/**
 * Promisify the CLI string
 * @param {string} cmd CLI command
 * @param {function} modifier Function that modifies the promise cmd output
 * @return {promise}
 */
function _promisify(cmd, modifier) {
  return new Promise((resolve, reject) => {
    exec(cmd, function(error, stdout, stderr) {
      if(error) {
        // @TODO logging errors
        //console.log(error);
        reject(error);
      }
      else {
        // @TODO handle strerr ?
        var out = modifier ? modifier(stdout) : stdout;
        resolve(out);
      }
    });
  });
}

