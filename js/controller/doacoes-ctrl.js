var app = angular.module("PainelAdm");
app.controller("doacoesCtrl", ['$scope', 'Page', 'ApiRequest', 'DoacoesApi', 'ObjectHandleRoute',
function ($scope, Page, ApiRequest, DoacoesApi, ObjectHandleRoute) {
  Page.setTitle('Doações');
  $scope.doacoes     = [];
  $scope.excDialogId = 'exc-doacao';
  $scope.DoacaoObjectRoute = ObjectHandleRoute;

  $scope.setObjectForDelete = function(doacao){
    $scope.objDelete = doacao;
    showDialog($scope.excDialogId);
  };
  $scope.delete = function(){
    if($scope.objDelete == null) return;
    ApiRequest.exclui($scope.objDelete._links.self.href).then(function(){
      showMessage('Doação excluída');
      refresh();
    });
  };
  refresh();
  function refresh(){
    ApiRequest.busca(DoacoesApi.getUrlAll()).then(function(data){
      $scope.doacoes = data._embedded.doacoes;
      atualizaElementos();
    });
  }
}])
.factory('DoacoesApi', function(){
  return {
    getUrlAll: function(){
      return "/doacao/search/findAllByOrderByIdAsc/";
    },
    getUrl: function(){
      return "/doacao/";
    }
  };
});
app.controller("doacaoCtrl", ['$scope', '$timeout', 'Page', 'ApiRequest', 'DoacoesApi', 'ObjectHandleRoute',
function ($scope, $timeout, Page, ApiRequest, DoacoesApi, ObjectHandleRoute) {
  $scope.isCadastro  = ObjectHandleRoute.get() == null;
  $scope.doacao      = $scope.isCadastro ? {tipo: 1, nome: ''} : ObjectHandleRoute.get();
  $scope.localizacao = {};

  var mapa = criaMapa('mapa-doacao', function(lat, lng){
    $timeout(function () {
      $scope.localizacao.lat    = lat;
      $scope.localizacao.lng    = lng;
      $scope.doacao.localizacao = JSON.stringify($scope.localizacao);
      atualizaLabelCampos();
    });
  }, $scope.isCadastro);
  if(!$scope.isCadastro){
    mapa.setPos(JSON.parse($scope.doacao.localizacao));
  }

  $scope.sendRequest = function(){
    if($scope.isCadastro){
      ApiRequest.insere(DoacoesApi.getUrl(), $scope.doacao).then(function(){
        window.location = '#doacoes';
        showMessage('Doação inserida');
      });
    }else{
      ApiRequest.altera($scope.doacao._links.self.href, {
        tipo        : $scope.doacao.tipo,
        nome        : $scope.doacao.nome,
        endereco    : $scope.doacao.endereco,
        localizacao : $scope.doacao.localizacao,
        informacoes : $scope.doacao.informacoes
      }).then(function(){
        window.location = '#doacoes';
        showMessage('Doação alterada');
      });
    }
  };
  $scope.$watch('doacao.nome', function() {
    Page.setTitle('Doação - ' + $scope.doacao.nome);
  });
}]);
