import BrainController from './brain.controller';

export default angular
.module('sherlock.brain', [])
.component('brain', {
  templateUrl: 'src/brain/brain.template.html',
  controller: BrainController
})
.name;
