import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'test-app/config/environment';
import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  throwOnUnhandled: true,
  workflow: [
    // RFC #1003 — `import X from 'ember'` is deprecated. The remaining hits
    // come from ember-data / ember-cli-fastboot internals on ember-source
    // 5.10+, so silence the family until those packages migrate.
    { handler: 'silence', matchId: /^deprecate-import-.*-from-ember$/ },
    // ember-modal-dialog@4.0.0 still uses `import { inject as service }`.
    // Until it's bumped, silence the deprecation it triggers.
    { handler: 'silence', matchId: 'importing-inject-from-ember-service' },
  ],
});

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
