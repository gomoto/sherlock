import pouchdbService from '../pouchdb/pouchdb.service';
import { INote } from '../note/note.module';

interface LevelTag {
  tag: string;
  notes: LevelNote[];
}

interface LevelNote {
  _id: string;
  title: string;
  tags: string[];
}

interface Level {
  inputTags: string[];
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
      inputTags: [],
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
          notes: null
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

  // Build the next level of tags and notes
  // based on the current level and a tag.
  goToNextLevel(currentLevelNumber: number, levelTag: LevelTag) {

    // remove levels above current
    this.levels.splice(currentLevelNumber + 1, this.levels.length);

    var nextLevel: Level = {
      inputTags: this.levels[currentLevelNumber].inputTags.concat(levelTag.tag),
      tags: [],
      notes: []
    };

    // create next level
    this.levels.push(nextLevel);

    // All notes with tag

    this.pouchdb.query('tags', {
      reduce: false,
      key: levelTag.tag
    })
    .then((response: any) => {
      this.$log.info('note query response', response);
      // one note per row
      var levelNotes = response.rows.map((row: any) => {
        return <LevelNote> {
          _id: row.id,
          title: row.value.title,
          tags: row.value.tags
        };
      });
      this.buildNextLevelFromLevelNotes(levelNotes, nextLevel);
    })
    .catch(this.$log.error);
  }

  // mutate nextLevel
  buildNextLevelFromLevelNotes(levelNotes: LevelNote[], nextLevel: Level) {
    // process all levelNotes

    var tagNotes: {[tag: string]: LevelNote[]} = {};

    // one note per row
    levelNotes.forEach((levelNote) => {
      var intersection = _.intersection(nextLevel.inputTags, levelNote.tags);

      // exact match, show it as a note.
      if (intersection.length === levelNote.tags.length) {
        nextLevel.notes.push(levelNote);
      }
      // partial match; include it under tags
      else if (intersection.length === nextLevel.inputTags.length) {
        levelNote.tags.forEach((tag) => {
          if (_.includes(nextLevel.inputTags, tag)) {
            return;
          }
          if (!tagNotes[tag]) {
            tagNotes[tag] = [];
          }
          tagNotes[tag].push(levelNote);
        });
      }
    });

    // convert tag map into list

    var levelTags = Object.keys(tagNotes).map((tag)=>{
      return {
        tag: tag,
        notes: <LevelNote[]> tagNotes[tag]
      };
    });

    nextLevel.tags = _.sortBy(levelTags, 'tag');
  }

}
