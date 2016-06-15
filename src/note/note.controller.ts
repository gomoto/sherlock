import pouchdbService from '../pouchdb/pouchdb.service';
import { IStateParams } from '../app.routing';
import { INote } from './note.module';

export default class NoteController {

  title: string;
  content: string;
  tags: string;

  static $inject = ['$log','pouchdb','$stateParams','$window'];

  constructor(
    private $log: ng.ILogService,
    private pouchdb: pouchdbService,
    private $stateParams: IStateParams,
    private $window: ng.IWindowService
  ) {
    this.setNoteState();
  }

  setNoteState() {
    if (this.$stateParams.note) {
      this.title = this.$stateParams.note.title;
      this.content = this.$stateParams.note.content;
      this.tags = this.$stateParams.note.tags.join(',');
    }
    else {
      this.title = '';
      this.content = '';
      this.tags = '';
    }
  }

  putNote() {

    let noteId: string;
    if (this.$stateParams.note) {
      noteId = this.$stateParams.note._id;
    }

    let tags: string[];
    if (this.tags.length === 0) {
      tags = [];
    }
    else {
      tags = this.tags.split(',');
    }

    let note: INote = {
      _id: noteId || this.createNoteId(),
      title: this.title,
      content: this.content,
      tags: tags
    };

    if (this.$stateParams.note) {
      note._rev = this.$stateParams.note._rev;
    }

    this.pouchdb.put(note)
    .then((response: PouchUpdateResponse) => {
      this.$log.info(response);
      note._rev = response.rev;
      this.$stateParams.note = note;//!
    })
    .catch((error: PouchUpdateError) => {
      this.$log.error('put note error', error);
    });

  }

  deleteNote() {

    if (!this.$stateParams.note) {
      return;
    }

    if (!this.$window.confirm('Really delete note?')) {
      return;
    }

    this.$stateParams.note._deleted = true;

    this.pouchdb.put(this.$stateParams.note)
    .then((response: PouchUpdateResponse) => {
      this.$log.info(response);
      this.$stateParams.note = null;//!
      this.setNoteState();
    })
    .catch((error: PouchUpdateError) => {
      this.$log.error('del note error', error);
    });

  }

  private createNoteId(): string {
    return 'note' + new Date().getTime().toString();
  }

}
