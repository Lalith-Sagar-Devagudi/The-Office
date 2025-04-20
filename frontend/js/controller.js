(function(){
  angular.module('TheOffice')
    .controller('OfficeController', OfficeController);

  OfficeController.$inject = ['GameService','$rootScope'];
  function OfficeController(GameService, $rootScope) {
    const vm = this;
    vm.tasks = ['File reports','Make coffee','Organize files'];
    vm.agents = [];
    vm.selectedAgent = null;

    // filter control
    vm.roles = ['CEO','Dev','HR'];
    vm.selectedRoles = vm.roles.slice();

    // When the user picks from the multi‑select:
    vm.onRoleSelect = () => {
     vm.selectedRoles.forEach(role => {
        GameService.getBus().emit('roleSelected', { role });
      });
    };

    vm.assign = (agent, task) => {
      agent.task = task;
      vm.selectedAgent = null;
      GameService.getBus().emit('taskAssigned',{agent,task});
    };

    $rootScope.$on('agentsSpawned',(_,agents) => {
      vm.agents = agents;
    });
    $rootScope.$on('agentClicked',(_,agent) => {
      vm.selectedAgent = agent;
    });
  }
})();
