(function (app) {
  'use strict';

  app.addModule('repos', init);

  var $context;

  function init() {
    renderColumns();
    getRepos();
  }

  function renderColumns() {
    var compiled = _.template(app.templates['columns-layout.html']);
    var out = compiled();
    app.render(out);
  }

  function getRepos() {
    $.get('/api/repos')
      .success(function (res) {
        displayRepos(res);
      })
      .fail(function (err) {
        console.log(err);
      });
  }

  function displayRepos(repos) {
    var compiled = _.template(app.templates['repos.html']);
    var out = compiled({repos: repos});
    var column = $('[data-column=1]');
    column.html(out);
    $context = $('[data-module=repos]');
    bindEvents();
  }

  function bindEvents() {
    var $item = $context.find('.list-group-item a');
    $item.on('click', getBranches);
  }

  // @TODO - to branches module - bindEvents triggers mediator event
  function getBranches(e) {
    e.preventDefault();
    $(this).closest('.list-group').find('>li').removeClass('active');
    $(this).closest('.list-group-item').addClass('active');
    var repo = $(this).text();
    app.loader('start');
    $.get('/api/branches', {repo: repo})
      .done(function (res) {
        app.mediator.publish('repos:branches', {branches: res[0], current: res[1], gitlog: res[2], repo: repo});
      })
      .fail(function (err) {
        if (err.responseJSON.error) {
          console.log(err.responseJSON.error);
        }
      })
      .always(function () {
        app.loader('stop');
      });
  }

})(App);
