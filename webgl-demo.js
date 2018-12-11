// INITIALIZE DEPENDANCIES
var fs = require('fs');

var OBJ = require('webgl-obj-loader');


var cubeRotation = 0.0;
var rms = 0.0;
var r = 0.;
var g = 0.;
var b = 0.;

main();

function pickColor(v)
{
  var a, b, c;
  // console.log("v: ", v);
  if (v > 38. && v < 39.) {
  a = 0.;
  b = 1.;
  c = 0.;
  }

  else if (v > 40) {
    a = 1.;
    b = 0.;
    c = 0.;

  } else {
    a = 0.;
    b = 0.;
    c = 1.;
  }

  // console.log(a, b, c);

  return [a, b, c];
}


//  console.log(rms);
//  const faceColors = [
//    [r,  g,  b,  1.0],    // Front face: white
//    [r,  g,  b,  1.0],    // Back face: red
//    [r,  g,  b,  1.0],    // Top face: green
//    [r,  g,  b,  1.0],    // Bottom face: blue
//    [r,  g,  b,  1.0],    // Right face: yellow
//    [r,  g,  b,  1.0],    // Left face: purple
//  ];

function minA(array)
{
  min = Infinity;

  for (i = 0; i < array.length; i++)
  {
    if (array[i] == Infinity)
    {

    }
    else
    {
      if (array[i] < min)
      {
        min = array[i];
      }
    }

  }

  return min;

}

function maxA(array)
{
  max = -Infinity;

  for (i = 0; i < array.length; i++)
  {
    if (array[i] == -Infinity)
    {

    }
    else
    {
      if (array[i] > max)
      {
        max = array[i];
      }
    }

  }

  return max;

}

function normalize(value, min, max)
{
  return (value - min) / (max - min);
}

//
// Start here
//
function main() {

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
        analyser.getByteFrequencyData(buffer);

        let pitchBuffer = buffer.slice(0);
        for (var i = 0; i < pitchBuffer.length; i++) {                    
            pitchBuffer[i] = Math.log10(Math.abs(pitchBuffer[i]));
        }

        
        /* RMS stands for Root Mean Square, basically the root square of the
        * average of the square of each value. */
        // Something is wrong with this so we are opting to use a volume-meter file instead. 
        // var rms = 0;
        // for (var i = 0; i < buffer.length; i++) {
        //     rms += buffer[i] * buffer[i];
        // }
        
        // rms = Math.sqrt(rms / (buffer.length))
        // rms = 20 * Math.log10(rms);
        // vals = pickColor(rms);
        // r = vals[0];
        // g = vals[1];
        // b = vals[2];

        // console.log("COLOR: ", r, g, b);
        

        draw();
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  };

  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoord;

  uniform mat4 uNormalMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;

    // Apply lighting effect

    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
`;

  // Fragment shader program

  const fsSource = `
  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;

  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
  }
`;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'), 
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(shaderProgram, gl);

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, shaderProgram, deltaTime);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(shaderProgram, gl) {
  // attributes located in your shaders and attach them to the shader program
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
   
  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
   
  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
   
  // create and initialize the vertex, vertex normal, and texture coordinate buffers
  // and save on to the mesh object
  var objStr = document.getElementById('my_cube.obj').innerHTML;  
  var mesh = new OBJ.Mesh(objStr);  
  OBJ.initMeshBuffers(gl, mesh);
  console.log(mesh);
  return mesh;
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, mesh, shaderProgram, deltaTime) {
  gl.clearColor(r, g, b, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation * .7,// amount to rotate in radians
              [0, 1, 0]);       // axis to rotate around (X)

  // now to render the mesh
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
   
  // it's possible that the mesh doesn't contain
  // any texture coordinates (e.g. suzanne.obj in the development branch).
  // in this case, the texture vertexAttribArray will need to be disabled
  // before the call to drawElements
  if(!mesh.textures.length){
    gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
  }
  else{
    // if the texture vertexAttribArray has been previously
    // disabled, then it needs to be re-enabled
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
  }
   
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  {
    const vertexCount = mesh.vertexBuffer.length;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw

  cubeRotation += deltaTime;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
