import design from './pouchdb.design';
import { INote, INotePartial } from '../note/note.module';
import { EventEmitter } from 'events';

export default class pouchdb extends EventEmitter {

  private db: PouchDB;
  private remote: PouchDB;

  static $inject = [
    '$log',
    '$q',
    '$rootScope'
  ];

  constructor(
    private $log: ng.ILogService,
    private $q: ng.IQService,
    private $rootScope: ng.IRootScopeService
  ) {

    super();

    $log.info('Initializing PouchDB service');

    // local db
    this.db = new PouchDB('sherlock');

    var stopListening = $rootScope.$on('$currentUser', (error, user) => {
      stopListening();
      // remote db
      this.remote = new PouchDB('https://sherlock.cloudant.com/' + user.username, {
        auth: {
          username: user.customData.cloudant_key,
          password: user.customData.cloudant_password
        }
      });
      // sync local with remote
      PouchDB.sync(this.db, this.remote, {
        live: true,
        retry: true
      })
      .on('complete', (info: any) => {
        this.emit('sync:complete', info);
      })
      .on('change', (change: any) => {
        this.emit('sync:change', change);
      })
      .on('paused', (info: any) => {
        this.emit('sync:paused', info);
      })
      .on('active', (info: any) => {
        this.emit('sync:active', info);
      })
      .on('denied', (err: any) => {
        this.emit('sync:denied', err);
      })
      .on('error', (err: any) => {
        this.emit('sync:error', err);
      });
    });

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

  emit(event: string, ...args: any[]): boolean {
    this.$log.info(event, ...args);
    return super.emit(event, ...args);
  }

  get(id: string): ng.IPromise<any> {
    // wait for index promise?
    return this.$q.resolve(this.db.get(id));
  }

  put(doc: any): ng.IPromise<any> {
    // wait for index promise?
    return this.$q.resolve(this.db.put(doc));
  }

  allDocs(options: PouchAllDocsOptions): ng.IPromise<any> {
    // wait for index promise?
    return this.$q.resolve(this.db.allDocs(options));
  }

  allNotes(): ng.IPromise<any> {
    // wait for index promise?

    let options = {
      startkey: 'note',
      endkey: 'note\ufff0',
      include_docs: true
    };
    return this.$q.resolve(this.db.allDocs(options));
  }

  bulkDocs(docs: any[]): ng.IPromise<any> {
    return this.$q.resolve(this.db.bulkDocs(docs));
  }

  query(viewName: string, options: any): ng.IPromise<any> {
    return this.$q.resolve(this.db.query(viewName, options));
  }

  destroy(): ng.IPromise<any> {
    return this.$q.resolve(this.db.destroy());
  }

  // Get notes with specified tag.
  // (content excluded from notes)
  getNotesWithTag(tag: string): ng.IPromise<any> {
    return this.query('tags', {
      reduce: false,
      key: tag
    })
    .then((response: any) => {
      this.$log.info('note query response', response);
      // one note per row
      return response.rows.map((row: PouchQueryRow) => {
        return {
          _id: row.id,
          title: row.value.title,
          tags: row.value.tags
        };
      });
    })
    .catch(this.$log.error);
  }

  getAllTags(): ng.IPromise<any> {
    return this.query('tags', {
      reduce: true,
      group: true
    })
    .then((response: any) => {
      this.$log.info('tag query response', response);
      // one tag per row
      return response.rows
      .filter((row: PouchQueryRow)=>{
        return row.key !== null;
      })
      .map((row: PouchQueryRow) => {
        return {
          tag: row.key,
          notes: <INotePartial> null
        };
      });
    })
    .catch(this.$log.error);
  }

}
