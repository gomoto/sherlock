import design from './pouchdb.design';
import { INote, INotePartial } from '../note/note.module';

export default class pouchdb {

  private db: PouchDB;

  static $inject = [
    '$log',
    '$q'
  ];

  constructor(
    private $log: ng.ILogService,
    private $q: ng.IQService
  ) {

    this.db = new PouchDB('sherlock');

    // Replicate from server

    // Index tags
    this.db.put(design)
    .then((response: any) => {
      $log.debug('design doc response', response);
    }).catch((error: any) => {
      // conflict ok?
      if (error.name !== 'conflict') {
        this.$log.error(error);
      }
    });

  }

  get(id: string): PouchPromise {
    // wait for index promise?
    return this.$q.resolve(this.db.get(id));
  }

  put(doc: any): PouchPromise {
    // wait for index promise?
    return this.$q.resolve(this.db.put(doc));
  }

  allDocs(options: PouchAllDocsOptions): PouchPromise {
    // wait for index promise?
    return this.$q.resolve(this.db.allDocs(options));
  }

  allNotes(): PouchPromise {
    // wait for index promise?

    let options = {
      startkey: 'note',
      endkey: 'note\ufff0',
      include_docs: true
    };
    return this.$q.resolve(this.db.allDocs(options));
  }

  bulkDocs(docs: any[]) {
    return this.$q.resolve(this.db.bulkDocs(docs));
  }

  query(viewName: string, options: any) {
    return this.$q.resolve(this.db.query(viewName, options));
  }

  destroy(): PouchPromise {
    return this.$q.resolve(this.db.destroy());
  }

  getNote(noteId: string): INote {
    // Trust that this will eventually be a Note
    var note = <INote> {
      _id: noteId
    };
    this.$q.resolve(this.db.get(noteId))
    .then((response: INote) => {
      note.title = response.title;
      note.content = response.content;
      note.tags = response.tags;
    })
    .catch(this.$log.error);
    return note;
  }

  // Get notes with specified tag.
  // (content excluded from notes)
  getNotesWithTag(tag: string): PouchPromise {
    return this.query('tags', {
      reduce: false,
      key: tag
    })
    .then((response: any) => {
      this.$log.info('note query response', response);
      // one note per row
      return response.rows.map((row: any) => {
        return {
          _id: row.id,
          title: row.value.title,
          tags: row.value.tags
        };
      });
    })
    .catch(this.$log.error);
  }

}
