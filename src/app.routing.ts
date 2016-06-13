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
    .state('main', {
      url: '/',
      template: '<main></main>'
    })
    .state('janitor', {
      template: '<janitor></janitor>'
    })
    .state('note', {
      template: '<note></note>'
    });

  }
];
