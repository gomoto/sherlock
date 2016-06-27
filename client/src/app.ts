import routing from './app.routing';
import stormpath from './app.stormpath';

import brain from './brain/brain.module';
import janitor from './janitor/janitor.module';
import navbar from './navbar/navbar.module';
import note from './note/note.module';
import pouchdb from './pouchdb/pouchdb.module';

angular.module('sherlock', [
  'ui.router',
  'stormpath',
  'stormpath.templates',
  'ngTagsInput',
  brain,
  janitor,
  navbar,
  note,
  pouchdb
])
.config(routing)
.run(stormpath);
