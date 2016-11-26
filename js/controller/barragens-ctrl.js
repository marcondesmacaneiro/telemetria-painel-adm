var app = angular.module("PainelAdm");
app.controller("barragensCtrl", ['$scope', 'Page', 'ApiRequest', 'BarragensApi', 'ObjectHandleRoute',
function ($scope, Page, ApiRequest, BarragensApi, ObjectHandleRoute) {
  Page.setTitle('Barragens');
  $scope.barragens   = [];
  $scope.historico   = {};
  $scope.excDialogId = 'exc-barragem';
  $scope.BarragemObjectRoute = ObjectHandleRoute;

  $scope.mostraTelaRegistraLeitura = function(barragem){
    $scope.historico = {barragem: barragem, datahora: (new Date).toLocaleString()};
    showDialog('inc-barragem-leitura');
    atualizaLabelCampos();
    $('#datahora').mask('00/00/0000 00:00:00');
    $('#comportas').mask('00/00');
  };
  $scope.adicionaRegistroLeitura = function(){
    var aDatahora = $scope.historico.datahora.split('/');
    var oDateIso  = new Date(aDatahora[1] + '/' + aDatahora[0] + '/' + aDatahora[2]);
    var comportas = $scope.historico.comportas.split('/');
    ApiRequest.insere(BarragensApi.getUrlHistorico(), {
      dataHora : oDateIso.toISOString().replace(/\..*$/, ''),
      montante : $scope.historico.montante,
      barragem : BarragensApi.getUrl() + $scope.historico.barragem.id,
      comportasAbertas  : comportas[0],
      comportasFechadas : comportas[1]
    }).then(function(){
      showMessage('Registro de leitura inserido');
      refresh();
    });
  };
  $scope.setObjectForDelete = function(barragem){
    $scope.objDelete = barragem;
    showDialog($scope.excDialogId);
  };
  $scope.delete = function(){
    if($scope.objDelete == null) return;
    ApiRequest.exclui(BarragensApi.getUrl() + $scope.objDelete.id).then(function(){
      showMessage('Barragem excluída');
      refresh();
    });
  };
  refresh();
  function refresh(){
    ApiRequest.busca(BarragensApi.getUrlAll()).then(function(data){
      $scope.barragens = data;
      atualizaElementos();
    });
  }
}])
.factory('BarragensApi', function(){
  return {
    getUrlAll: function(){
      return "/api/barragem/";
    },
    getUrl: function(){
      return "/barragem/";
    },
    getUrlHistorico: function(){
      return "/barragemhistorico/";
    }
  };
});
app.controller("barragemCtrl", ['$scope', '$timeout', 'Page', 'ApiRequest', 'BarragensApi', 'ObjectHandleRoute',
function ($scope, $timeout, Page, ApiRequest, BarragensApi, ObjectHandleRoute) {
  $scope.isCadastro  = ObjectHandleRoute.get() == null;
  $scope.barragem    = $scope.isCadastro ? {nome: ''} : ObjectHandleRoute.get();
  $scope.localizacao = {};

  var mapa = criaMapa('mapa-barragem', function(lat, lng){
    $timeout(function () {
      $scope.localizacao.lat    = lat;
      $scope.localizacao.lng    = lng;
      $scope.barragem.localizacao = JSON.stringify($scope.localizacao);
      atualizaLabelCampos();
    });
  }, $scope.isCadastro);
  if(!$scope.isCadastro){
    mapa.setPos(JSON.parse($scope.barragem.localizacao));
  }

  $scope.sendRequest = function(){
    if($scope.isCadastro){
      ApiRequest.insere(BarragensApi.getUrl(), $scope.barragem).then(function(){
        window.location = '#barragens';
        showMessage('Barragem inserida');
      });
    }else{
      ApiRequest.altera(BarragensApi.getUrl() + $scope.barragem.id, {
        nome        : $scope.barragem.nome,
        localizacao : $scope.barragem.localizacao
      }).then(function(){
        window.location = '#barragens';
        showMessage('Barragem alterada');
      });
    }
  };

  $scope.$watch('barragem.nome', function() {
    Page.setTitle('Barragem - ' + $scope.barragem.nome);
  });
}]);
