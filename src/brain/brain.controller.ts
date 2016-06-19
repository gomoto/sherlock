import pouchdbService from '../pouchdb/pouchdb.service';
import { INote } from '../note/note.module';

interface LevelTag {
  tag: string;
  note: LevelNote;
}

interface LevelNote {
  _id: string;
  title: string;
  tags: string[];
}

interface Level {
  tags: LevelTag[];
  notes: LevelNote[];
}

export default class BrainController {

  levels: Level[];
  note: INote;

  static $inject = ['$log','pouchdb','$rootElement','$scope','$window'];

  constructor(
    private $log: ng.ILogService,
    private pouchdb: pouchdbService,
    private $rootElement: ng.IRootElementService,
    private $scope: ng.IScope,
    private $window: ng.IWindowService
  ) {

    this.note = null;

    // Build level 0

    this.levels = [{
      tags: null,
      notes: null
    }];

    // All tags

    this.pouchdb.query('tags', {
      reduce: true,
      group: true
    })
    .then((response: any) => {
      this.$log.info('tag query response', response);
      this.levels[0].tags = response.rows
      .filter((row: PouchQueryRow)=>{
        return row.key !== null;
      })
      .map((row: PouchQueryRow) => {
        return <LevelTag> {
          tag: row.key,
          note: null
        };
      });
    })
    .catch(this.$log.error);

    // All notes with zero tags

    this.pouchdb.query('tags', {
      reduce: false,
      key: null
    })
    .then((response: any) => {
      this.$log.info('note query response', response);
      this.levels[0].notes = response.rows.map((row: any) => {
        return <LevelNote> {
          _id: row.id,
          title: row.value.title,
          tags: []
        };
      });
    })
    .catch(this.$log.error);

  }

  openNote(noteId: string) {
    this.$log.debug('opening note');
    this.$rootElement.off('mouseover');

    this.note = this.pouchdb.getNote(noteId);

    this.$rootElement.on('mouseover', () => {
      this.$scope.$apply(() => {
        this.$rootElement.off('mouseover');
        this.closeNote();
      });
    });
  }

  closeNote() {
    this.$log.debug('closing note');
    this.note = null;
  }

}
