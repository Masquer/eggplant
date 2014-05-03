'use strict';

function toHexString(bytes) {
  return bytes.map(function(byte) {
    return ("0"+(byte & 0xFF).toString(16)).substr(-2)
  }).join('');
}

function getBase64(str) {
  return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}

function processFoto(data) {
  for (var r in data) {
    data[r].foto = "data:image/jpeg;base64," + getBase64(toHexString(data[r].foto));
  }
  return data;
}

function playSound(soundname) {
  var sound = document.getElementById( soundname );
  sound.play();
}

function EggplantCtrl($scope, $http, $timeout, socket) {
  $http.get('/api/comers/').
    success(function(data) {
      $scope.comers = processFoto(data);
    });
  $http.get('/api/leavers/').
    success(function(data) {
      $scope.leavers = processFoto(data);
    });
  socket.on('beep', function () {
    playSound('beep');
    $scope.warning = 'true';
    $timeout(function() {
      $scope.warning = 'false';
    }, 3000);
  });
  socket.on('pass', function () {
    playSound('pass');
    $http.get('/api/lastone/').
      success(function(data) {
        $scope.lastone = processFoto(data)[0];
        $scope.pass = 'true';
        $timeout(function() {
          $scope.pass = 'false';
        }, 3000);
      });
    $http.get('/api/comers/').
      success(function(data) {
        $scope.comers = processFoto(data);
      });
    $http.get('/api/leavers/').
      success(function(data) {
        $scope.leavers = processFoto(data);
      });
  });
}
