import * as angular from 'angular';
import * as uiRouter from 'angular-ui-router';
import routing from './src/app.routing';
import Note from './src/note/note.module';

angular.module('sherlock', [
  uiRouter as string,
  Note
])
.config(routing);
