import * as PouchDB from 'pouchdb';
import design from './pouchdb.design';

export default class pouchdb {

  private db: PouchDB;

  static $inject = ['$log','$q'];

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

  put(doc: any): PouchPromise {
    // wait for index promise?

    return this.$q.resolve(this.db.put(doc));
  }

  allDocs(options: PouchAllDocsOptions): PouchPromise {
    // wait for index promise?

    options.startkey = 'note';
    options.endkey = 'note\ufff0';
    return this.$q.resolve(this.db.allDocs(options));
  }

  bulkDocs(docs: any[]) {
    return this.$q.resolve(this.db.bulkDocs(docs));
  }

  destroy(): PouchPromise {
    return this.$q.resolve(this.db.destroy());
  }

}
