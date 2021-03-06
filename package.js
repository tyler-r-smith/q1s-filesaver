Package.describe({
  name: 'q1s:filesaver',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'A wrapper for tomi Meteor upload to allow for multiple forms',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/tyler-r-smith/q1s-filesaver',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3');
  api.use('ecmascript');
  api.use(["templating", "underscore"]);
  api.use("mongo");
  api.use("jquery");
  api.use("iron:router@1.0.0");
  api.use("random");
  api.use("q1s:server-to-client@0.0.0");
  api.addFiles("client.js");
  api.addFiles("server.js");
  api.mainModule("lib.js");
});

Package.onTest(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use(["templating", "underscore"]);
  api.use("mongo");
  api.use("iron:router");
  api.addFiles("server.js");
});
