// design doc
// emit each tag as key
// emit title as value

import { INote } from '../note/note.module';

export default {

  _id: '_design/tags',

  views: {
    tags: {

      map: function (doc: INote) {
        if (doc.tags) {
          if (doc.tags.length === 0) {
            emit(null, {title: doc.title, tags: []});
          }
          else {
            for (var i = 0; i < doc.tags.length; i++) {
              emit(doc.tags[i], {title: doc.title, tags: doc.tags});
            }
          }
        }
      }.toString(),

      reduce: '_count'

    }
  }

}
