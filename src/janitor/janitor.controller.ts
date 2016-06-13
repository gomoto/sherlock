import pouchdbService from '../pouchdb/pouchdb.service';

export default class JanitorController {

  notes: any[];

  static $inject = ['$log', 'pouchdb', '$window'];

  constructor(
    private $log: ng.ILogService,
    private pouchdb: pouchdbService,
    private $window: ng.IWindowService
  ) {

    this.getAllNotes();

  }

  toJson(obj: any): string {
    return angular.toJson(obj, true);
  }

  getAllNotes() {

    this.pouchdb.allNotes()
    .then((response: any) => {
      this.$log.debug('allNotes response', response);
      this.notes = response.rows.map((row: any) => {
        return row.doc;
      });
    })
    .catch(this.$log.error);

  }

  deleteAllNotes() {

    if (!this.$window.confirm('Really delete all notes?')) {
      return;
    }

    this.$log.debug('Deleting all notes');

    var deletedNotes = this.notes.map((note: any) => {
      note._deleted = true;
      return note;
    });

    this.pouchdb.bulkDocs(deletedNotes)
    .then((response: any) => {
      this.$log.debug('bulkDocs response', response);
      this.notes = [];
    })
    .catch(this.$log.error);

  }

  destroyDatabase() {

    if (!this.$window.confirm('Really destroy database?')) {
      return;
    }

    this.$log.debug('Destroying database');

    this.pouchdb.destroy().then((response: any) => {
      this.$log.debug('db destroyed response',response);
      this.notes = [];
    });

  }

}
