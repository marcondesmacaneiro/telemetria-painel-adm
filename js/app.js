var app = angular.module("PainelAdm", ["ngRoute"]);
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
  .when("/leituraponto/", {
    controller  : 'leituraPontoCtrl',
    templateUrl : "pages/leitura-ponto.html"
  })
  .when("/abrigos", {
    controller  : 'abrigosCtrl',
    templateUrl : "pages/abrigos.html"
  })
  .when("/abrigo/:id?", {
    controller  : 'abrigoCtrl',
    templateUrl : "pages/abrigo.html"
  })
  .when("/abrigocontato/:id", {
    controller  : 'abrigoContatoCtrl',
    templateUrl : "pages/abrigo-contato.html"
  })
  .when("/doacoes", {
    controller  : 'doacoesCtrl',
    templateUrl : "pages/doacoes.html"
  })
  .when("/doacao/", {
    controller  : 'doacaoCtrl',
    templateUrl : "pages/doacao.html"
  })
  .when("/contatos", {
    controller  : 'contatosCtrl',
    templateUrl : "pages/contatos.html"
  })
  .when("/usuarios", {
    controller  : 'usuariosCtrl',
    templateUrl : "pages/usuarios.html"
  })
  .otherwise({
    controller  : 'leituraPontosCtrl',
    templateUrl : "pages/leitura-pontos.html"
  });
}]);
app.factory('Page', function(){
  var title = '';
  return {
    getTitle : function() { return title; },
    setTitle : function(newTitle) { title = newTitle; }
  };
});
app.run(['$rootScope', function($rootScope) {
  $rootScope.$on('$viewContentLoaded', function() {
    atualizaElementos();
  });
}]);
app.controller('mainCtrl', ['$scope', 'Page', function($scope, Page){
  $scope.Page = Page;
}])
.factory('ApiRequest', ['$q', '$http', function($q, $http){
  return {
    busca: function(url) {
      var promise = $q.defer();
      $http.get(url).then(function(response){
        promise.resolve(response.data);
      }, function() {
        promise.reject();
      });
      return promise.promise;
    },
    insere: function(url, data){
      return $http.post(url, data);
    },
    altera: function(url, data){
      return $http.patch(url, data);
    },
    exclui: function(url){
      return $http.delete(url);
    }
  }
}])
.factory('ObjectHandleRoute', function(){
  var _object = null;
  return {
    get: function(){
      return _object;
    },
    set: function(object){
      _object = object;
    },
    reset: function(){
      _object = null;
    }
  };
});
function criaMapa(idContainer, callbackMarker, useGeolocation){
  var defaultPosition = {lat: -57.213973, lng: -59.638101};
  var map = new google.maps.Map(document.getElementById(idContainer), {
    center : defaultPosition,
    zoom   : 14
  });
  var marker = new google.maps.Marker({
    draggable : true,
    position  : defaultPosition
  });
  if(callbackMarker){
    marker.setMap(map);
    marker.addListener('position_changed', function(){
      var markerPos = marker.getPosition();
      callbackMarker(markerPos.lat(), markerPos.lng(), markerPos.toString(), markerPos.toUrlValue());
    });
  }
  if (navigator.geolocation && useGeolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {lat: position.coords.latitude, lng: position.coords.longitude};
      map.setCenter(pos);
      marker.setPosition(pos);
    });
  }
  return {
    setPos: function(position){
      map.setCenter(position);
      marker.setPosition(position);
    }
  };
}
function atualizaLabelCampos(){
  setTimeout(function(){
    $('.mdl-textfield').each(function(){
      this.MaterialTextfield.checkDirty();
    });
  }, 10);
}
function atualizaElementos(){
  setTimeout(function(){
    componentHandler.upgradeAllRegistered();
  }, 10);
}
function showDialog(id){
  var dialog = document.getElementById(id + '-dialog');
  dialog.showModal();
  if(typeof dialog.hascloseevent == 'undefined'){
    dialog.hascloseevent = true;
    $('.close', dialog).click(function(){
      dialog.close();
    });
  }
}
function showMessage(message){
  var snackbarContainer = document.querySelector('#toast-container');
  snackbarContainer.MaterialSnackbar.showSnackbar({message: message});
}
function showLoadingSpinner(){
  $('.page-content-loading').show();
}
function hideLoadingSpinner(){
  $('.page-content-loading').hide();
}
function isEmpty(valor){
  return typeof valor == 'undefined' || valor.trim().length == 0;
}
function aplicaMascaraTelefone(selector){
  var target = $(selector);
  var comportamentoMascara = function (val) {
    return val.replace(/\D/g, '').length === 11 ? '00 00000-0000' : '00 0000-00009';
  },
  options = {
    onKeyPress: function(val, e, field, options) {
      field.mask(comportamentoMascara.apply({}, arguments), options);
    }
  };
  target.mask(comportamentoMascara, options);
}
