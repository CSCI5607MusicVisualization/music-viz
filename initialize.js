var redValue = 0.0;
var greenValue = 0.0;
var blueValue = 1.0;
var PointredValue = 1.0;
var PointblueValue = 0.0;
var PointgreenValue = 1.0;

var alpha = 1.0;
/** ----------for back ground-----------*/
var Texture = {};
var bufRect = {};
var textureObj;
var progBG;

function initGL(canvas,SpecCanvas) 
{
  try 
  {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    ctx = canvas.getContext('webgl2');
  } catch (e) {
  }
  if (!gl||!ctx) 
  {
    alert("Could not initialise WebGL, sorry :-(");
  }
}

  function getShader(env, id) 
{
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }
  //console.log("gl is:",env);
  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent;
    }
    k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = env.createShader(env.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = env.createShader(env.VERTEX_SHADER);
  } else {
    return null;
  }

  env.shaderSource(shader, str);
  env.compileShader(shader);

  if (!env.getShaderParameter(shader, env.COMPILE_STATUS)) {
    alert(env.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function initShaders() {
  
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  //gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  //gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  //gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
  shaderProgram.diffuseUniform = gl.getUniformLocation(shaderProgram, "diffuseRamp");
  shaderProgram.specularUniform = gl.getUniformLocation(shaderProgram, "specularRamp");    
  shaderProgram.modelColor = gl.getUniformLocation(shaderProgram, "uColor");
  shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
  shaderProgram.useTexturesUniform = gl.getUniformLocation(shaderProgram, "uUseTextures");
  shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
  shaderProgram.hasTexure = gl.getUniformLocation(shaderProgram, "uHasTexure");
  shaderProgram.lightCount = gl.getUniformLocation(shaderProgram, "lightCount");  
  shaderProgram.lightLocation = gl.getUniformLocation(shaderProgram, "uLightLocation");
  shaderProgram.lightVector = gl.getUniformLocation(shaderProgram, "uSpotDirection");
  shaderProgram.lightcone = gl.getUniformLocation(shaderProgram, "spotCosCutoff");
  shaderProgram.lightIntensity = gl.getUniformLocation(shaderProgram, "LightIntensity");

  shaderProgram.lightSpecularColor = gl.getUniformLocation(shaderProgram, "uLightSpecularColor");
  shaderProgram.lightDiffuseColor = gl.getUniformLocation(shaderProgram, "uLightDiffuseColor");
}


function handleLoadedTexture(texture) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  gl.generateMipmap(gl.TEXTURE_2D);

  gl.bindTexture(gl.TEXTURE_2D, null);
  /**-------------------Be sure to end the flip y aix after you finish using!-------------- */
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
}

function initTexture( object, url) {
  object.texture = gl.createTexture();
  object.texture.image = new Image();
  object.texture.image.crossOrigin = "anonymous";
  object.texture.image.onload = function () {
    handleLoadedTexture( object.texture );
  }
  object.texture.image.src = url;
}

function initTextures(){
  initTexture( app.specular, "textures/specular.png");  
  initTexture( app.diffuse, "textures/diffuse.png");

  // Shrubbery
  initTexture( app.models.treeLrg, "textures/cloud.jpg")
  initTexture( app.models.treeMed, "textures/cloud.jpg")
  initTexture( app.models.treeSml, "textures/cloud.jpg")

  initTexture( app.models.bushes, "textures/cloud.jpg")
}

function initBuffers() {
  // initialize the mesh's buffers
  for( mesh in app.meshes ){
    obj_utils.initMeshBuffers( gl, app.meshes[ mesh ] );
    // this loops through the mesh names and creates new
    // model objects and setting their mesh to the current mesh
    app.models[ mesh ] = {};
    app.models[ mesh ].mesh = app.meshes[ mesh ];
  }
  app.models.skylight = {};
  app.models.skylight.mesh = app.models.room_floor.mesh;
}

function initAudio() 
{
    //ctx = document.getElementById("canvas").getContext("2d");
    //InitBackground();
    // initSpectrumShader();
    var audioContext = new (window.AudioContext
        || window.webkitAudioContext || window.mozAudioContext)();

    var analyser; 
    analyser  = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.9;
    analyser.fftSize = 512;
    analyser.connect(audioContext.destination);
    var frequencyBins = new Uint8Array(analyser.frequencyBinCount);
    var dataArray = new Float32Array(analyser.fftSize);
    let buffer = new Uint8Array(analyser.frequencyBinCount);

    var source;
    function getData() {
      source = audioContext.createBufferSource();
      source.connect(audioContext.destination);//    meter  
      request = new XMLHttpRequest();
      request.open('GET', 'christmas.ogg', true);
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
   // var WIDTH = 1080;
  //  var HEIGHT = 500;
    var value, h, w;
    var arr = new Array();
    var pointArr = new Array();
    var waveArr = new Array();
    var k=0;
    function draw()  
    {
        InitArray();
        app.spectrum = arr;
      };
    function InitArray()
    {
        var xstart=-1.0;
        var delta =4.0/frequencyBins.length+0.005;// 0.002
        var j= 0;
        for (var i = 0; i < frequencyBins.length;) 
        {
            value = frequencyBins[j];
            j++;
            h = (value / 64);
            //console.log("frequencyBins is:",value);
            // w = WIDTH / frequencyBins.length;
                // ctx.fillStyle = `rgb(${Math.random() * w},${Math.random() * h},${Math.random() * w})`;
            arr[i++]=h;

        }
    }
    function animate() 
    // Generates an RMS value based on intensity
    // Intensity rarely goes above .5, but RMS is clamped [0, 1]
    {
        analyser.getByteFrequencyData(frequencyBins);
        analyser.getFloatTimeDomainData(dataArray);

        /* RMS stands for Root Mean Square, basically the root square of the
        * average of the square of each value. */
        var rms = 0;
        for (var i = 0; i < dataArray.length; i++) {
            rms += dataArray[i] * dataArray[i];
        }
        rms = Math.sqrt(rms / (dataArray.length));
        
        app.intensity = rms;
        // This will return the value in decibals.
        // var v = Math.abs(20 * Math.log10(rms));
        draw();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  // };
}