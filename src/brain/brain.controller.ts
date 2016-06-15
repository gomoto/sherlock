import pouchdbService from '../pouchdb/pouchdb.service';
import { INote } from '../note/note.module';

interface LevelTag {
  _id: string;
  title: string;
  tag: string;
  tags: string[];
}

interface LevelTitle {
  _id: string;
  title: string;
}

interface Level {
  tags: LevelTag[];
  titles: LevelTitle[]
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
      titles: null
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
          _id: null,
          tag: row.key,
          title: null,
          tags: null
        };
      });
    })
    .catch(this.$log.error);

    // All notes with no tags

    this.pouchdb.query('tags', {
      reduce: false,
      key: null
    })
    .then((response: any) => {
      this.$log.info('note query response', response);
      this.levels[0].titles = response.rows.map((row: any) => {
        return <LevelTitle> {
          _id: row.id,
          title: row.value.title
        };
      });
    })
    .catch(this.$log.error);

  }

  openNote(noteId: string) {
    this.$log.debug('opening note');
    this.$rootElement.off('mouseover');
    this.pouchdb.get(noteId)
    .then((note: INote) => {
      this.note = note;
      this.$rootElement.on('mouseover', () => {
        this.$scope.$apply(() => {
          this.$rootElement.off('mouseover');
          this.closeNote();
        });
      });
    })
    .catch(this.$log.error);
  }

  closeNote() {
    this.$log.debug('closing note');
    this.note = null;
  }

}
