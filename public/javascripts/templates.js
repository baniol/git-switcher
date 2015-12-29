App.templates={"branches.html":"<div data-module=\"branches\">\n    <div class=\"page-header\">\n        <h2>Branches</h2>\n    </div>\n    <ul class=\"list-group\">\n        <% _.each(branches, function(i, k) { %>\n        <li class=\"list-group-item\"><a href=\"#\"><%= i %></a></li>\n        <% }); %>\n    </ul>\n</div>\n","columns-layout.html":"<div class=\"col-sm-6\" data-column=\"1\"></div>\n<div class=\"col-sm-6\" data-column=\"2\"></div>\n","repos.html":"<div data-module=\"repos\">\n    <div class=\"page-header\">\n        <h2>Repositories</h2>\n    </div>\n    <ul class=\"list-group\">\n        <% _.each(repos, function(i, k) { %>\n        <li class=\"list-group-item\"><a href=\"#\"><%= i %></a></li>\n        <% }); %>\n    </ul>\n</div>\n\n"}