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
  selectedTag: string;
  tags: LevelTag[];
  notes: LevelNote[];
}

export default class BrainController {

  levels: Level[];
  note: INote;

  static $inject = [
    '$log',
    'pouchdb',
    '$scope',
    '$window'
  ];

  constructor(
    private $log: ng.ILogService,
    private pouchdb: pouchdbService,
    private $scope: ng.IScope,
    private $window: ng.IWindowService
  ) {

    this.note = null;

    // Build level 0

    this.levels = [{
      selectedTag: null,
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

  onTitleMouseenter(levelNumber: number, levelNote: LevelNote) {
    this.openNote(levelNote._id);
    this.assertLevel(levelNumber);
    this.levels[levelNumber].selectedTag = null;
  }

  openNote(noteId: string) {
    this.$log.debug('opening note');
    this.note = this.pouchdb.getNote(noteId);
  }

  closeNote() {
    if (this.note === null) {
      return;
    }
    this.$log.debug('closing note');
    this.note = null;
  }

  // Build the next level of tags and notes
  // based on the current level and a tag.
  onTagMouseenter(levelNumber: number, levelTag: LevelTag) {
    this.closeNote();
    this.assertLevel(levelNumber);
    this.levels[levelNumber].selectedTag = levelTag.tag;

    var inputTags = this.levels.map((level) => {
      return level.selectedTag;
    });

    if (levelTag.notes === null) {
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
        this.buildNextLevel(levelNotes, inputTags);
      })
      .catch(this.$log.error);
    }
    else {
      this.buildNextLevel(levelTag.notes, inputTags);
    }
  }

  buildNextLevel(levelNotes: LevelNote[], inputTags: string[]) {
    // process all levelNotes

    var tagNotes: {[tag: string]: LevelNote[]} = {};
    var notes: LevelNote[] = [];

    // one note per row
    levelNotes.forEach((levelNote) => {
      var intersection = _.intersection(inputTags, levelNote.tags);

      // exact match, show it as a note.
      if (intersection.length === levelNote.tags.length) {
        notes.push(levelNote);
      }
      // partial match; include it under tags
      else if (intersection.length === inputTags.length) {
        levelNote.tags.forEach((tag) => {
          if (_.includes(inputTags, tag)) {
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

    var tags = _.sortBy(levelTags, 'tag');

    this.levels.push({
      selectedTag: null,
      tags: tags,
      notes: notes
    });
  }

  // remove levels above n
  assertLevel(n: number) {
    this.$log.debug('Assert level ', n);
    this.levels.splice(n + 1, this.levels.length);
  }

  onLevelMouseover(event: JQueryMouseEventObject, levelNumber: number) {
    this.closeNote();
    this.assertLevel(levelNumber);
    this.levels[levelNumber].selectedTag = null;
  }

}
