app.controller("leituraPontosCtrl", ['$scope', '$routeParams', 'Page', 'ApiRequest', 'LeituraPontosApi', 'ObjectHandleRoute',
function ($scope, $routeParams, Page, ApiRequest, LeituraPontosApi, ObjectHandleRoute) {
  Page.setTitle('Pontos de Leitura');
  $scope.pontos      = [];
  $scope.objDelete   = {};
  $scope.excDialogId = 'exc-pontoleitura';
  $scope.LeituraPontoObjectRoute = ObjectHandleRoute;

  $scope.mostraTelaRegistraLeitura = function(ponto, sensor){
    $scope.leitura = {ponto: ponto, sensor: sensor, datahora: (new Date).toLocaleString()};
    showDialog('inc-registro-leitura');
    atualizaLabelCampos();
    $('#datahora').mask('00/00/0000 00:00:00');
  };
  $scope.adicionaRegistroLeitura = function(){
    ApiRequest.insere(LeituraPontosApi.getUrlLeituraSensor(), {
      leitura  : $scope.leitura.leitura,
      dataHora : getDataIso($scope.leitura.datahora),
      leituraPontoSensor : LeituraPontosApi.getUrlLeituraPontoSensor($scope.leitura.sensor.id)
    }).then(function(){
      showMessage('Registro de leitura inserido');
      ApiRequest.busca($scope.leitura.ponto._links.sensores.href).then(function(data){
        $scope.leitura.ponto.sensores = data;
        atualizaElementos();
      });
    });
  };
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
    ApiRequest.altera(LeituraPontosApi.getUrlLeituraPontoSensor(sensor.id), sensor).then(function(){
      ApiRequest.busca(ponto._links.sensores.href).then(function(data){
        ponto.sensores = data;
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
          pontoAtual.sensores = data;
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
      return "/leituraponto/search/findAllByOrderByIdAsc";
    },
    getUrl: function(){
      return "/leituraponto/";
    },
    getUrlLeituraSensor: function() {
      return "/leiturasensor/";
    },
    getUrlLeituraPontoSensor: function(id) {
      return "/leiturapontosensor/" + id;
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
      ApiRequest.altera($scope.ponto._links.self.href, {
        nome        : $scope.ponto.nome,
        endereco    : $scope.ponto.endereco,
        localizacao : $scope.ponto.localizacao
      }).then(function() {
        window.location = '#leiturapontos';
        showMessage('Ponto de leitura alterado');
      });
    }
  };
  $scope.$watch('ponto.nome', function() {
    Page.setTitle('Ponto de Leitura - ' + $scope.ponto.nome);
  });
}]);
