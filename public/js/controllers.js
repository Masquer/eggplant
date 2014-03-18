'use strict';

function toHexString(bytes) {
  return bytes.map(function(byte) {
    return ("0"+(byte & 0xFF).toString(16)).substr(-2)
  }).join('');
}

function getBase64(str) {
  return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}

function EggplantCtrl($scope, $http, $route, $timeout, socket) {
  $http.get('/api/comers/').
    success(function(data) {
      for (var r in data) {
        data[r].foto = "data:image/jpeg;base64," + getBase64(toHexString(data[r].foto));
      }
      $scope.comers = data;
    });
  $http.get('/api/leavers/').
    success(function(data) {
      for (var r in data) {
        data[r].foto = "data:image/jpeg;base64," + getBase64(toHexString(data[r].foto));
      }
      $scope.leavers = data;
    });
  socket.on('beep', function () {
    $scope.warning = 'true';
    $timeout(function() {
      $scope.warning = 'false';
    }, 3000);
  });
  socket.on('pass', function () {
    $route.reload();
  });
}
