import pouchdbService from '../pouchdb/pouchdb.service';
import { IStateParams } from '../app.routing';
import { INote } from './note.module';

export default class NoteController {

  title: string;
  content: string;
  tags: string;

  static $inject = ['$log','pouchdb','$stateParams'];

  constructor(
    private $log: ng.ILogService,
    private pouchdb: pouchdbService,
    private $stateParams: IStateParams
  ) {
    if ($stateParams.note) {
      this.getNote($stateParams.note._id);
    }
  }

  getNote(noteId: string) {
    this.pouchdb.get(noteId)
    .then((note: any) => {
      this.title = note.title;
      this.content = note.content;
      this.tags = note.tags.join(',');
      return note;
    })
    .then(this.$log.info)
    .catch(this.$log.error);
  }

  putNote() {
    let noteId: string;
    let rev: string;
    if (this.$stateParams.note) {
      noteId = this.$stateParams.note._id;
      rev = this.$stateParams.note._rev;
    }
    else {
      noteId = this.createNoteId();
    }
    let note: INote = {
      _id: noteId,
      _rev: rev,
      title: this.title,
      content: this.content,
      tags: this.tags.split(',')
    };
    this.pouchdb.put(note)
    .then(this.$log.info)
    .catch(this.$log.error);
  }

  private createNoteId(): string {
    return 'note' + new Date().getTime().toString();
  }

}
