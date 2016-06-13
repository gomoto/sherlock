import NoteController from './note.controller';

export default angular
.module('sherlock.note', [])
.component('note', {
  templateUrl: 'src/note/note.template.html',
  controller: NoteController
})
.name;

interface INote {
  _id: string;
  _rev?: string;
  _deleted?: boolean;
  title: string;
  content: string;
  tags: string[];
}

export { INote }
