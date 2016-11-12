var app = angular.module("PainelAdm");
app.controller("leituraPontosCtrl", ['$scope', '$routeParams', 'Page', 'ApiRequest', 'LeituraPontosApi', 'ObjectHandleRoute',
function ($scope, $routeParams, Page, ApiRequest, LeituraPontosApi, ObjectHandleRoute) {
  Page.setTitle('Pontos de Leitura');
  $scope.pontos      = [];
  $scope.objDelete   = {};
  $scope.excDialogId = 'exc-pontoleitura';
  $scope.LeituraPontoObjectRoute = ObjectHandleRoute;

  $scope.setObjectForDelete = function(ponto){
    $scope.objDelete = ponto;
    showDialog($scope.excDialogId);
  };
  $scope.delete = function(){
    if($scope.objDelete == null) return;
    ApiRequest.exclui($scope.objDelete._links.self.href).then(function(){
      showMessage('Ponto de leitura excluído');
      refresh();
    });
  };
  $scope.alteraSensor = function(ponto, sensor){
    ApiRequest.altera(sensor._links.self.href, sensor).then(function(){
      ApiRequest.busca(ponto._links.sensores.href).then(function(data){
        ponto.sensores = data._embedded.leiturapontosensores;
        atualizaElementos();
      });
    });
  };
  refresh();
  function refresh(){
    ApiRequest.busca(LeituraPontosApi.getUrlAll()).then(function(data){
      var pontos = data._embedded.leiturapontos;
      jQuery.each(pontos, function(){
        var pontoAtual = this;
        ApiRequest.busca(pontoAtual._links.sensores.href).then(function(data){
          pontoAtual.sensores = data._embedded.leiturapontosensores;
          atualizaElementos();
        });
      });
      $scope.pontos = pontos;
    });
  }
}])
.factory('LeituraPontosApi', function(){
  return {
    getUrlAll: function(){
      return "http://localhost:8080/leituraponto/search/findAllByOrderByIdAsc";
    },
    getUrl: function(){
      return "http://localhost:8080/leituraponto/";
    }
  };
});
app.controller("leituraPontoCtrl", ['$scope', '$routeParams', '$timeout', 'Page', 'ApiRequest', 'LeituraPontosApi', 'ObjectHandleRoute',
function ($scope, $routeParams, $timeout, Page, ApiRequest, LeituraPontosApi, ObjectHandleRoute) {
  $scope.isCadastro  = ObjectHandleRoute.get() == null;
  $scope.ponto       = $scope.isCadastro ? {nome: ''} : ObjectHandleRoute.get();
  $scope.localizacao = {};

  var mapa = criaMapa('mapa-leitura-ponto', function(lat, lng){
    $timeout(function () {
      $scope.localizacao.lat   = lat;
      $scope.localizacao.lng   = lng;
      $scope.ponto.localizacao = JSON.stringify($scope.localizacao);
      atualizaLabelCampos();
    });
  }, $scope.isCadastro);
  if(!$scope.isCadastro){
    mapa.setPos(JSON.parse($scope.ponto.localizacao));
  }

  $scope.sendRequest = function() {
    if($scope.isCadastro){
      ApiRequest.insere(LeituraPontosApi.getUrl(), $scope.ponto).then(function() {
        window.location = '#leiturapontos';
        showMessage('Ponto de leitura inserido');
      });
    }else{
      ApiRequest.altera($scope.ponto._links.self.href, $scope.ponto).then(function() {
        window.location = '#leiturapontos';
        showMessage('Ponto de leitura alterado');
      });
    }
  };
  $scope.$watch('ponto.nome', function() {
    Page.setTitle('Ponto de Leitura - ' + $scope.ponto.nome);
  });
}]);
