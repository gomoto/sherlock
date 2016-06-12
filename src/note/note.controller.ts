export default class NoteController {

  constructor(
    private $log: ng.ILogService
  ) {}

  static $inject = ['$log'];

  submitNote() {
    this.$log.debug('Note submitted!');
  }

}
