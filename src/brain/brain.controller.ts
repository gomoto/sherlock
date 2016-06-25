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
    '$document',
    '$element',
    '$log',
    'pouchdb',
    '$scope',
    '$state',
    '$timeout',
    '$window'
  ];

  constructor(
    private $document: ng.IDocumentService,
    private $element: ng.IAugmentedJQuery,
    private $log: ng.ILogService,
    private pouchdb: pouchdbService,
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
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

    this.pouchdb.getAllTags()
    .then((tags: LevelTag[]) => {
      this.levels[0].tags = tags;
    });

    // All notes with zero tags

    this.pouchdb.getNotesWithTag(null)
    .then((levelNotes: LevelNote[]) => {
      this.levels[0].notes = levelNotes
    });

  }

  $onInit() {
    this.$log.debug('Initializing brain component');
    this.$window.addEventListener('resize', this.translate, false);
  }

  $onDestroy() {
    this.$log.debug('Destroying brain component');
    this.$window.removeEventListener('resize', this.translate, false);
  }

  onTitleMouseenter(levelNumber: number, levelNote: LevelNote) {
    this.openNote(levelNote._id);
    this.assertLevel(levelNumber);
    this.levels[levelNumber].selectedTag = null;
  }

  openNote(noteId: string) {
    this.$log.debug('opening note');
    this.pouchdb.get(noteId)
    .then((note: INote) => {
      this.note = note;
      this.translate();
    });
  }

  closeNote() {
    if (this.note === null) {
      return;
    }
    this.$log.debug('closing note');
    this.note = null;
    this.translate();
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
      this.pouchdb.getNotesWithTag(levelTag.tag)
      .then((levelNotes: LevelNote[]) => {
        this.buildNextLevel(levelNotes, inputTags);
      });
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

    this.translate();
  }

  // remove levels above n
  assertLevel(n: number) {
    if (this.levels.length - 1 <= n) {
      return;
    }
    this.$log.debug('Assert level ', n);
    this.levels.splice(n + 1, this.levels.length);
    this.translate();
  }

  onLevelMouseover(event: JQueryMouseEventObject, levelNumber: number) {
    this.closeNote();
    this.assertLevel(levelNumber);
    this.levels[levelNumber].selectedTag = null;
  }

  translate = () => {
    this.$timeout(() => {
      // level widths + note width
      var contentWidth = this.calculateWidth('brain .level') + this.calculateWidth('brain .note');
      var outerWidth = this.calculateElementWidth(this.$element[0]);
      var diff = Math.max(0, contentWidth - outerWidth);
      var transform = 'translateX(-' + diff + 'px)';
      this.$element.css({
        webkitTransform: transform,
        MozTransform: transform,
        msTransform: transform,
        OTransform: transform,
        transform: transform
      });
      this.$log.debug('Translating %s pixels to the left', diff);
    });
  }

  private calculateWidth(selector: string) {
    var sum = 0;
    var elements = this.$document[0].querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
      sum += this.calculateElementWidth(elements.item(i));
    }
    return sum;
  }

  private calculateElementWidth(element: Element) {
    var width = this.$window.getComputedStyle(element).getPropertyValue('width');
    return parseFloat(width);
  }

  editNote() {
    this.$state.go('note', {note: this.note});
  }

}
