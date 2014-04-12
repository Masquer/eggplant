var socket = io.connect();

function playSound(soundname) {
  var sound = document.getElementById( soundname );
  sound.play();
}

socket.on('beep', function () {
  playSound('beep');
});