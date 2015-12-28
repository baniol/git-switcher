var App = {
  modules: {},
  containerId: 'main-container',
  alertsId: 'alerts',
  mediator: new Mediator(),
  addModule: function (moduleName, initFunction) {
    this.modules[moduleName] = {
      init: initFunction
    };
  },
  render: function (html) {
    document.getElementById(this.containerId).innerHTML = html;
  },
  info: function (text, type) {
    var alertBar = $('#'+this.alertsId);
    alertBar.removeClass('alert-info alert-success');
    alertBar.addClass('alert-'+type).html(text);
  },
  loader: function (action) {
    var container = $('#' + this.containerId);
    if (action === 'start') {
      container.append($('<div class="overlay" />'));
    }
    else if (action === 'stop') {
      container.find('.overlay').remove();
    }
  }
};
