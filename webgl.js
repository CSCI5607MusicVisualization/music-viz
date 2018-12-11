function animate() {
  app.timeNow = new Date().getTime();
  app.elapsed = app.timeNow - app.lastTime;
  if (app.lastTime != 0) {
    // animate stuff
    if( !app.camera.disable ){
      cameraMove();
    }
    if( app.camera.shake ){
      cameraShake();
    }
  }
  app.lastTime = app.timeNow;
} 

function tick() {
  requestAnimFrame(tick);
  app.drawScene();
  animate();
}

function webGLStart( meshes ) {
  app.meshes = meshes;
  canvas = document.getElementById("mycanvas");
  initAudio();
  initGL(canvas);
  initShaders();
  initBuffers();
  initPointerLock();
  initTextures();
  
  document.onkeydown = cameraKeyDownHandler;
  document.onkeyup = cameraKeyUpHandler;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  tick();
}

function initAudio() {
  window.onload = function () {
    var ctx = document.getElementById("canvas").getContext("2d");
    var audioContext = new (window.AudioContext
        || window.webkitAudioContext || window.mozAudioContext)();

    var analyser; 
    analyser  = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.9;
    analyser.fftSize = 512;
    analyser.connect(audioContext.destination);
    var frequencyBins = new Uint8Array(analyser.frequencyBinCount);
    let buffer = new Uint8Array(analyser.frequencyBinCount);

    var source;
    var meter;
    function getData() {
      source = audioContext.createBufferSource();
      meter = createAudioMeter(audioContext);
      source.connect(meter);      
      request = new XMLHttpRequest();
      request.open('GET', 'viper.ogg', true);
      request.responseType = 'arraybuffer';
      
      request.onload = function() {
        var audioData = request.response;

        audioContext.decodeAudioData(audioData, function(buffer) {
            myBuffer = buffer;
            songLength = buffer.duration;
            source.buffer = myBuffer;
            source.loop = true;

            source.connect(analyser);
            source.start(audioContext.currentTime + 2);
          },
          function(e){"Error with decoding audio data" + e.error});
      }

      request.send();
    }

    getData();
    var WIDTH = 1080;
    var HEIGHT = 500;
    var value, h, w;

    function draw() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        // console.log(meter.volume)
        for (var i = 0; i < frequencyBins.length; i++) {
            value = frequencyBins[i];
            h = HEIGHT * (value / 255);
            w = WIDTH / frequencyBins.length;
                ctx.fillStyle = `rgb(${Math.random() * w},${Math.random() * h},${Math.random() * w})`;
            ctx.fillRect(i * w, HEIGHT - 1, w, -h);
        }
    };

    function animate() {
        analyser.getByteFrequencyData(frequencyBins);
        // console.log(frequencyBins.indexOf(Math.max(...frequencyBins)), Math.max(...frequencyBins));
        analyser.getFloatTimeDomainData(buffer);

        // let pitchBuffer = buffer.slice(0);
        // for (var i = 0; i < pitchBuffer.length; i++) {                    
        //     pitchBuffer[i] = Math.log10(Math.abs(pitchBuffer[i]));
        // }

        
        /* RMS stands for Root Mean Square, basically the root square of the
        * average of the square of each value. */
        // Something is wrong with this so we are opting to use a volume-meter file instead. 
        var rms = 0;
        for (var i = 0; i < buffer.length; i++) {
            rms += buffer[i] * buffer[i];
        }
        
        rms = Math.sqrt(rms / (buffer.length))
        rms = 20 * Math.log10(rms);
        vals = pickColor(rms);
        r = vals[0];
        g = vals[1];
        b = vals[2];

        draw();
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  };
}

$(document).ready(function(){
  obj_utils.downloadMeshes({
      'tunnel_ceiling':'models/tunnel_ceiling.obj',
      'tunnel_walls':'models/tunnel_walls.obj',
      'room_walls': 'models/room_walls.obj',
      'room_ceiling': 'models/room_ceiling.obj',
      'room_floor': 'models/room_floor.obj',
      'room_tunnel_ceiling': 'models/room_tunnel_ceiling.obj',
      'room_tunnel_walls': 'models/room_tunnel_walls.obj',
      'room_wall_broken': 'models/room_wall_broken.obj',
      'room_wall_unbroken': 'models/room_wall_unbroken.obj',
      'suzanne': 'models/boulder.obj',
      'pedestal': 'models/pedestal.obj',
      'boulder': 'models/boulder.obj',
    },
    webGLStart
  );
});