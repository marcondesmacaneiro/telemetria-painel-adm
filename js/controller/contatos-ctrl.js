var app = angular.module("PainelAdm");
app.controller("contatosCtrl", ['$scope', 'Page', 'ApiRequest', 'ContatosApi', function ($scope, Page, ApiRequest, ContatosApi) {
  Page.setTitle('Contatos Gerais');
  $scope.isCadastro  = true;
  $scope.objDelete   = null;
  $scope.contato     = {};
  $scope.contatos    = [];
  $scope.excDialogId = 'exc-contato';
  refresh();

  $scope.mostraTelaCadastro = function(){
    $scope.contato = {};
    $scope.isCadastro  = true;
    showDialog('inc-contato');
  };
  $scope.sendRequest = function(){
    if($scope.isCadastro){
      ApiRequest.insere(ContatosApi.getUrl(), $scope.contato).then(function(){
        refresh();
        showMessage('Contato inserido');
      });
    }else{
      ApiRequest.altera($scope.contato._links.self.href, {
        descricao : $scope.contato.descricao,
        banner    : $scope.contato.banner
      }).then(function(){
        refresh();
        showMessage('Contato alterado');
      });
    }
  };
  $scope.setContatoForUpdate = function(contato){
    $scope.contato = angular.copy(contato);
    $scope.isCadastro = false;
    showDialog('inc-contato');
    atualizaLabelCampos();
  };
  $scope.setObjectForDelete = function(telefone){
    $scope.objDelete = telefone;
    showDialog($scope.excDialogId);
  };
  $scope.delete = function(){
    if($scope.objDelete == null) return;
    ApiRequest.exclui($scope.objDelete._links.self.href).then(function(){
      showMessage('Contato excluído');
      refresh();
    });
  };
  $scope.refresh = function(){
    refresh();
  };
  function refresh(){
    ApiRequest.busca(ContatosApi.getUrlAll()).then(function(data){
      var contatos    = data._embedded.contatosgerais;
      jQuery.each(contatos, function(){
        var contatoAtual  = this;
        ApiRequest.busca(this._links.telefones.href).then(function(data){
          contatoAtual.telefones = data._embedded.contatosgeraistelefones;
          atualizaElementos();
        });
      });
      $scope.contatos = contatos;
    });
  }
}])
.factory('ContatosApi', function(){
  return {
    getUrlAll: function(){
      return "http://localhost:8080/contatogeral/search/findAllByOrderByIdAsc/";
    },
    getUrl: function(contatoId){
      contatoId = parseInt(contatoId) ? parseInt(contatoId) : '';
      return "http://localhost:8080/contatogeral/" + contatoId;
    }
  };
});
app.controller('contatoCtrl', ['$scope', 'ApiRequest', 'ContatoTelefoneApi', function($scope, ApiRequest, ContatoTelefoneApi){
  $scope.isNovoTelefone = true;
  $scope.telefone       = {};
  $scope.telefones      = [];

  $scope.sendRequest = function(contato){
    if(isEmpty($scope.telefone.numero)) return;
    if($scope.isNovoTelefone){
      ApiRequest.insere(ContatoTelefoneApi.getUrl(), {
        numero: $scope.telefone.numero, contatoGeral: contato._links.self.href
      }).then(function(){
        $scope.refresh();
        $scope.telefone = {};
        $scope.formTelContatoGeral.$setPristine();
        showMessage('Telefone inserido');
      });
    }else{
      ApiRequest.altera($scope.telefone._links.self.href, {
        numero: $scope.telefone.numero
      }).then(function(){
        $scope.refresh();
        $scope.telefone = {};
        $scope.formTelContatoGeral.$setPristine();
        showMessage('Telefone alterado');
        $scope.isNovoTelefone = true;
      });
    }
  };
  $scope.alteraTelefone = function(telefone){
    $scope.telefone = angular.copy(telefone);
    atualizaLabelCampos();
    $scope.isNovoTelefone = false;
  };
}])
.factory('ContatoTelefoneApi', function(){
  return {
    getUrl: function(){
      return "http://localhost:8080/contatogeraltelefone/";
    }
  };
});
