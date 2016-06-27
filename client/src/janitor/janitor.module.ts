import JanitorController from './janitor.controller';

export default angular
.module('sherlock.janitor', [])
.component('janitor', {
  templateUrl: 'client/src/janitor/janitor.template.html',
  controller: JanitorController
})
.name;
