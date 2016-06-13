import JanitorController from './janitor.controller';

export default angular
.module('sherlock.janitor', [])
.component('janitor', {
  templateUrl: 'src/janitor/janitor.template.html',
  controller: JanitorController
})
.name;
