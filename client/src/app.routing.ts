import { INote } from './note/note.module';

export default [

  '$locationProvider',
  '$stateProvider',
  '$urlRouterProvider',

  (
    $locationProvider: ng.ILocationProvider,
    $stateProvider: ng.ui.IStateProvider,
    $urlRouterProvider: ng.ui.IUrlRouterProvider
  ) => {

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');

    $stateProvider
    .state('brain', {
      url: '/',
      template: '<brain></brain>'
    })
    .state('janitor', {
      template: '<janitor></janitor>'
    })
    .state('note', {
      params: {
        note: null
      },
      template: '<note></note>'
    })
    .state('login', {
      url: '/login',
      template: '<div sp-login-form></div>'
    });

  }
];

interface IStateParams {
  note?: INote;
};

export { IStateParams }
