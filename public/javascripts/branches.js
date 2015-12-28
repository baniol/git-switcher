(function (app) {
  'use strict';

  app.addModule('branches', init);

  var $context;

  var repo;

  function init() {
    bindEvents();
  }

  function bindEvents() {
    app.mediator.subscribe('repos:branches', function (res) {
      repo = res.repo;
      displayCurrent(res.current, res.gitlog);
      displayBranches(res.branches);
    });
  }

  function displayCurrent(current, gitlog) {
    app.info(current + '<br>' + gitlog, 'info');
  }

  function displayBranches(branches) {
    var compiled = _.template(app.templates['branches.html']);
    var out = compiled({branches: branches});
    var column = $('[data-column=2]');
    column.html(out);

    $context = $('[data-module=branches]');
    var $item = $context.find('.list-group-item a');
    $item.on('click', checkout);
  }

  function checkout(e) {
    e.preventDefault();
    var branch = $(this).text();

    alertify.confirm("Are you sure to checkout?", function (e) {
      if (e) {
        app.loader('start');
        $.post('/api/checkout', {branch: branch, repo: repo})
            .done(function (res) {
              var info = res[0] + '<br>' + res[1];
              app.info(info, 'success');
            })
            .fail(function (err) {
              alertify.alert(err);
            })
            .always(function () {
              app.loader('stop');
            });
      }
    });
  }
})(App);
