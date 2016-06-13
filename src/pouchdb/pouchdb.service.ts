import * as PouchDB from 'pouchdb';
import design from './pouchdb.design';

export default class pouchdb {

  private db: PouchDB;

  static $inject = ['$log'];

  constructor(
    private $log: ng.ILogService
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

  put(doc: any) {
    // wait for index promise?

    this.db.put(doc).then((x:any) => { this.$log.debug(x) });
  }

  allDocs(options: PouchAllDocsOptions): PouchPromise {
    // wait for index promise?

    options.startkey = 'note';
    options.endkey = 'note\ufff0';
    return this.db.allDocs(options);
  }

  bulkDocs(docs: any[]) {
    return this.db.bulkDocs(docs);
  }

  destroy(): PouchPromise {
    return this.db.destroy();
  }

}
