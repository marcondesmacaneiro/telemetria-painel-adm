var app = angular.module("PainelAdm");
app.controller("abrigosCtrl", ['$scope', '$timeout', 'Page', 'ApiRequest', 'AbrigoApi',
function ($scope, $timeout, Page, ApiRequest, AbrigoApi) {
  Page.setTitle('Abrigos');
  $scope.abrigos     = [];
  $scope.excDialogId = 'exc-abrigo';
  refresh();
  var idForDelete = null;
  $scope.setIdForDelete = function(id){
    idForDelete = id;
    showDialog($scope.excDialogId);
  };
  $scope.delete = function(){
    var id = parseInt(idForDelete);
    if(!isNaN(id)){
      ApiRequest.exclui(AbrigoApi.getUrl(id)).then(function(){
        showMessage('Abrigo excluído');
        refresh();
      });
    }
  };
  function refresh(){
    ApiRequest.busca(AbrigoApi.getUrl()).then(function(data){
      $scope.abrigos = data;
      atualizaElementos();
    });
  }
}]);

app.controller("abrigoCtrl", ['$scope', '$routeParams', '$timeout', 'Page', 'ApiRequest', 'AbrigoApi',
function ($scope, $routeParams, $timeout, Page, ApiRequest, AbrigoApi) {
  var isCadastro   = typeof $routeParams.id == 'undefined';
  $scope.descbotao = isCadastro ? 'Cadastrar' : 'Alterar';
  var abrigoId     = parseInt($routeParams.id);
  //se tiver um id e não for um número
  if(isNaN(abrigoId) && typeof $routeParams.id !== 'undefined'){
    window.location = '#abrigos';
    return;
  }
  $scope.localizacao = {};
  $scope.abrigo      = {nome: ''};
  var mapa = criaMapa('mapa-abrigo', function(lat, lng){
    $timeout(function () {
      $scope.localizacao.lat    = lat;
      $scope.localizacao.lng    = lng;
      $scope.abrigo.localizacao = JSON.stringify($scope.localizacao);
      atualizaLabelCampos();
    });
  }, isCadastro);
  if(!isCadastro){
    ApiRequest.busca(AbrigoApi.getUrl(abrigoId)).then(function(data){
      $scope.abrigo = data;
      Page.setTitle('Abrigo - ' + data.nome);
      mapa.setPos(JSON.parse($scope.abrigo.localizacao));
    }, function(){
      showMessage('Não foi possível carregar o abrigo');
    });
  }
  $scope.sendRequest = function(){
    if(isCadastro){
      ApiRequest.insere(AbrigoApi.getUrl(abrigoId), $scope.abrigo).then(function(){
        window.location = '#abrigos';
        showMessage('Abrigo Inserido');
      });
    }else{
      ApiRequest.altera(AbrigoApi.getUrl(abrigoId), $scope.abrigo).then(function(){
        window.location = '#abrigos';
        showMessage('Abrigo alterado');
      });
    }
  };
  $scope.$watch('abrigo.nome', function() {
    Page.setTitle('Abrigo - ' + $scope.abrigo.nome);
  });
}])
.factory('AbrigoApi', function() {
  return {
    getUrl: function(abrigoId) {
      var id = abrigoId ? parseInt(abrigoId) : '';
      return "http://localhost:8080/api/abrigo/" + id;
    }
  }
});

app.controller('abrigoContatoCtrl', ['$scope', '$routeParams', '$timeout', 'Page', 'ApiRequest', 'AbrigoApi', 'AbrigoContatoApi',
function($scope, $routeParams, $timeout, Page, ApiRequest, AbrigoApi, AbrigoContatoApi){
  var idAbrigo = parseInt($routeParams.id);
  if(isNaN(idAbrigo)){
    window.location = '#abrigos';
    return;
  }
  var isAlteracao    = false;
  $scope.excDialogId = 'exc-abrigo-contato';
  $scope.contato     = {principal: false, abrigo: {id: idAbrigo}};
  $scope.contatos    = [];
  ApiRequest.busca(AbrigoApi.getUrl(idAbrigo)).then(function(data){
    Page.setTitle('Contatos - ' + data.nome);
  });
  refresh();
  $scope.setPrincipal = function(contato){
    ApiRequest.altera(AbrigoContatoApi.getUrl(idAbrigo) + contato.id, contato).then(function(){
      refresh();
    }, function(){
      contato.principal = false;
    });
  };
  $scope.alterar = function(contato){
    isAlteracao = true;
    atualizaLabelCampos();
    $scope.contato = angular.copy(contato);
  };
  var idForDelete = null;
  $scope.setIdForDelete = function(id){
    idForDelete = id;
    showDialog($scope.excDialogId);
  };
  $scope.delete = function(){
    var id = parseInt(idForDelete);
    if(!isNaN(id)){
      ApiRequest.exclui(AbrigoContatoApi.getUrl(idAbrigo) + id).then(function(){
        callBackRequest('Contato excluído');
      });
    }
  };
  $scope.sendRequest = function(){
    if(isAlteracao){
      ApiRequest.altera(AbrigoContatoApi.getUrl(idAbrigo) + $scope.contato.id, $scope.contato).then(function(){
        isAlteracao = false;
        callBackRequest('Contato Alterado');
      });
    }else{
      delete $scope.contato.id;
      ApiRequest.insere(AbrigoContatoApi.getUrl(idAbrigo), $scope.contato).then(function(){
        callBackRequest('Contato Inserido');
      });
    }
  };
  $scope.$watchGroup(['contato.responsavel', 'contato.telefone'], function(){
    var emBranco     = isEmpty($scope.contato.responsavel) && isEmpty($scope.contato.telefone);
    $scope.descbotao = !emBranco && isAlteracao ? 'Alterar' : 'Cadastrar';
    if(emBranco){
      isAlteracao = false;
      $scope.contato.principal = false;
      $scope.contato.abrigo.id = idAbrigo;
    }
  });
  function refresh(){
    ApiRequest.busca(AbrigoContatoApi.getUrl(idAbrigo)).then(function(data){
      $scope.contatos = data;
      verificaPrincipal();
      atualizaElementos();
    }, function(){
      showMessage('Não foi possível carregar os contatos');
    });
  }
  function callBackRequest(message){
    refresh();
    $scope.contato = {principal: false, abrigo: {id: idAbrigo}};
    $scope.formAbrigoContato.$setPristine();
    showMessage(message);
    atualizaLabelCampos();
  }
  function verificaPrincipal(){
    $scope.temPrincipal = false;
    jQuery.each($scope.contatos, function(){
      $scope.temPrincipal = this.principal;
      return !this.principal;
    });
  }
}])
.factory('AbrigoContatoApi', function(){
  return {
    getUrl: function(abrigoId){
      return "http://localhost:8080/api/abrigo/" + abrigoId + "/contato/";
    }
  }
});
