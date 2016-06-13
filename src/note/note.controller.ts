import pouchdbService from '../pouchdb/pouchdb.service';

export default class NoteController {

  title: string;
  content: string;
  tags: string;

  static $inject = ['$log', 'pouchdb'];

  constructor(
    private $log: ng.ILogService,
    private pouchdb: pouchdbService
  ) {}

  submitNote() {
    this.pouchdb.put({
      _id: 'note' + new Date().getTime().toString(),
      title: this.title,
      content: this.content,
      tags: this.tags.split(',')
    })
  }

}
