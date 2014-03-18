var socket = io.connect('/');

function playSound(soundname) {
  var thissound = document.getElementById( soundname );
  thissound.play();
}

socket.on('beep', function () {
  playSound('beep');
});