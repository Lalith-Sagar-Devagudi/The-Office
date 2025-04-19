angular.module('TheOffice', [])
  .service('GameService', function() {
    let eventsBus;
    this.setBus = bus => eventsBus = bus;
    this.getBus = () => eventsBus;
  });
