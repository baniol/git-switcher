'use strict';

var express = require('express');
var router = express.Router();

var reposConfig = require('../config/repos');

var git = require('../libs/git');
git.init(reposConfig);

router.get('/repos', function(req, res) {
  res.json(git.getRepos());
});

router.get('/branches', function(req, res) {
  git.getRepoInfo(req.query.repo)
      .then(info => res.json(info))
      .catch(error => {
          //@TODO - log error
          res.status(400).json({error: `There was an error obtaining info for repo: ${req.query.repo}`})
      });
});

router.post('/checkout', function(req, res) {
  git.checkout(req.body.repo, req.body.branch)
      .then(info => res.json(info))
      .catch(error => res.json({error: error}));
});

module.exports = router;
