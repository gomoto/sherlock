import * as angular from 'angular';
import * as uiRouter from 'angular-ui-router';
import routing from './app.routing';

import brain from './brain/brain.module';
import janitor from './janitor/janitor.module';
import navbar from './navbar/navbar.module';
import note from './note/note.module';
import pouchdb from './pouchdb/pouchdb.module';

angular.module('sherlock', [
  uiRouter as string,
  brain,
  janitor,
  navbar,
  note,
  pouchdb
])
.config(routing);
