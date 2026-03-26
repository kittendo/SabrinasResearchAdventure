// Audio specific setup functions are here as they must load after user
// interaction so they can't be in the main load sequence in setup anyways

function loadAndSetupAudio() { // must be called from user interaction for sound consent
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  loadSounds(0);
}

function loadSounds(k) {  //////////////////////////////////////// CHANGE TO RECURSIVE
  const request = new XMLHttpRequest();
  request.open("GET", soundPaths[k], true);
  request.responseType = "arraybuffer";
  // console.log(k, soundPaths[k]);
  request.onload = function () {
    audioCtx.decodeAudioData(
      request.response,
      function (buffer) {
        sounds.push(buffer);
        if (k == soundPaths.length - 1) {
          soundOn = true; // signal all sounds loaded
        } else {
          loadSounds(k + 1);
        }
      },
      function (e) {
        console.error("Error decoding audio file", e);
      },
    );
  };
  request.send();
}

function playSound(k, rate = 1.0, volume = 1.0, rand = true) {
  if (!soundOn) return;
  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();
  source.buffer = sounds[k];
  let scale = 1
  if (rand) scale = 0.9 + Math.random() * 0.2;
  gainNode.gain.value = gameVolume * volume * scale;
  scale = 1
  if (rand) scale = 0.9 + Math.random() * 0.2;
  source.playbackRate.value = rate * scale;
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start(0);
}
