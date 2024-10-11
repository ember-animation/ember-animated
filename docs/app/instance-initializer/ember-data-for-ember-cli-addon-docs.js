/**
 * This is to fix an error like
 *
 * Could not find module `@ember-data/adapter` imported from `ember-cli-addon-docs/adapters/-addon-docs`
 * Could not find module `@ember-data/serializer` imported from `ember-cli-addon-docs/serializers/-addon-docs`
 *
 * which should not happen even though ember-cli-addon-docs declares ember-data as dependency and has those imports.
 */
import Adapter from '@ember-data/adapter';
import Serializer from '@ember-data/serializer';

export class AddonDocsAdapter extends Adapter {}
export class AddonDocsSerializer extends Serializer {}

function initialize() {}

export default {
  initialize,
};
