var app = angular.module("PainelAdm");
app.controller("leituraPontosCtrl", ['$scope', 'Page', function ($scope, Page) {
  $scope.excDialogId = 'exc-pontoleitura';
  Page.setTitle('Pontos de Leitura');
  var idForDelete = null;
  $scope.setIdForDelete = function(id){
    idForDelete = id;
    showDialog($scope.excDialogId);
  };
  $scope.delete = function(){
    var id = parseInt(idForDelete);
    if(isNaN(id)){
      return;
    }
    sendRequest();
  };
  function sendRequest() {

  }
}]);
app.controller("leituraPontoCtrl", ['$scope', '$routeParams', 'Page', function ($scope, $routeParams, Page) {
  var isCadastro   = typeof $routeParams.id == 'undefined';
  $scope.descbotao = isCadastro ? 'Cadastrar' : 'Alterar';
  var pontoId      = parseInt($routeParams.id);
  //se tiver um id e não for um número
  if(isNaN(pontoId) && typeof $routeParams.id !== 'undefined'){
    window.location = '#leitura';
  }
  $scope.nomeponto = '';
  $scope.$watch('nomeponto', function() {
    Page.setTitle('Ponto de Leitura - ' + $scope.nomeponto);
  });
  criaMapa('mapa-leitura-ponto', function(lat, lng){
    $scope.latitude  = lat;
    $scope.longitude = lng;
    $scope.$apply();
    atualizaLabelCampos();
  }, isCadastro);
  $scope.sendRequest = function(){
    //TODO: Utilizar variável isCadastro
  };
}]);
