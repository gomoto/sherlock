import * as angular from 'angular';
import * as uiRouter from 'angular-ui-router';
import routing from './app.routing';
import Note from './note/note.module';
import pouchdb from './pouchdb/pouchdb.module';

angular.module('sherlock', [
  uiRouter as string,
  Note,
  pouchdb
])
.config(routing);
