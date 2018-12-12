
var redValue = 0.0;
var blueValue = 1.0;
var alpha = 1.0;

function initGL(canvas,SpecCanvas) 
{
  try 
  {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    ctx = SpecCanvas.getContext('experimental-webgl')|| SpecCanvas.getContext('webgl') ;
    ctx.viewportWidth = SpecCanvas.width;
    ctx.viewportHeight = SpecCanvas.height;
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
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
  shaderProgram.modelColor = gl.getUniformLocation(shaderProgram, "uColor");
  shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
  shaderProgram.useTexturesUniform = gl.getUniformLocation(shaderProgram, "uUseTextures");
  shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
  shaderProgram.hasTexure = gl.getUniformLocation(shaderProgram, "uHasTexure");
  shaderProgram.lightLocation = gl.getUniformLocation(shaderProgram, "uLightLocation");
  shaderProgram.lightVector = gl.getUniformLocation(shaderProgram, "uSpotDirection");
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
  initTexture( app.models.room_ceiling, "textures/stony_ground.jpg" );
  initTexture( app.models.room_walls, "textures/stone_wall.png" );
  initTexture( app.models.room_floor, "textures/room_floor.jpg" );
  app.models.room_tunnel_walls.texture = app.models.room_walls.texture;
  app.models.room_wall_broken.texture = app.models.room_walls.texture;
  app.models.room_wall_unbroken.texture = app.models.room_walls.texture;
  app.models.room_tunnel_ceiling.texture = app.models.room_ceiling.texture;
  app.models.boulder.texture = app.models.room_ceiling.texture;
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

function initAudio() {
  window.onload = function () 
  {
    //ctx = document.getElementById("canvas").getContext("2d");
    initSpectrumShader();

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
   // var WIDTH = 1080;
  //  var HEIGHT = 500;
    var value, h, w;
    var arr = new Array();
    var k=0;
    function draw()  
    {
        //ctx.clearRect(0, 0, WIDTH, HEIGHT);
        // console.log(meter.volume)
        var xstart=-1.0;
        var delta = 0.002;//SpecCanvas.width/frequencyBins.length
        for (var i = 0; i < frequencyBins.length; i++) 
        {
            value = frequencyBins[i];
            h = (value / 255);
            //console.log("frequencyBins is:",value);
            // w = WIDTH / frequencyBins.length;
            //     ctx.fillStyle = `rgb(${Math.random() * w},${Math.random() * h},${Math.random() * w})`;
            // ctx.fillRect(i * w, HEIGHT - 1, w, -h);
            arr[i++]=xstart;
            arr[i++]=0.0;
            arr[i++]=0.0;
        
            arr[i++]=xstart;
            arr[i++]=h;
            arr[i++]=0.0;
            xstart=xstart+delta;
            if (xstart>1.0) 
            {
                xstart=-1.0;
            }
            // arr[i++]=R*Math.cos(2*PI/NUM*k);     //circle
            // arr[i++]=R*Math.sin(2*PI/NUM*k);
            // arr[i++]=0.0;
            
            // arr[i++]=(R+value)*Math.cos(2*PI/NUM*k);     //spectrum
            // arr[i++]=(R+value)*Math.sin(2*PI/NUM*k);
            // arr[i++]=0.0;
           // console.log("Spectrum: ",arr[i-6], arr[i-5], arr[i-4],arr[i-3],arr[i-2],arr[i-1]);
            // k++;
            // if (k>NUM) 
            // {
            //     k=0;     //store N points
            // }
        }
        var Spectrumbuffers = Array2Buffers(ctx,arr);
        drawSprctrum(ctx, Spectrumbuffers,frequencyBins.length);
    };

    function animate() {
        analyser.getByteFrequencyData(frequencyBins);
        // console.log(frequencyBins.indexOf(Math.max(...frequencyBins)), Math.max(...frequencyBins));
        //analyser.getFloatTimeDomainData(buffer);
        analyser.getByteFrequencyData(buffer);
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

function initSpectrumShader()
{
  var fragmentShader = getShader(ctx, "SpectrumShader-fs");
  var vertexShader = getShader(ctx, "SpectrumShader-vs");

  SpectrumProgram = ctx.createProgram();
  ctx.attachShader(SpectrumProgram, vertexShader);
  ctx.attachShader(SpectrumProgram, fragmentShader);
  ctx.linkProgram(SpectrumProgram);

  if (!ctx.getProgramParameter(SpectrumProgram, ctx.LINK_STATUS)) {
    alert("Could not initialise SpectrumProgram shaders");
  }

  ctx.useProgram(SpectrumProgram);
  SpectrumProgram.vertexPositionAttribute = ctx.getAttribLocation(SpectrumProgram, 'aPos');
  ctx.enableVertexAttribArray(SpectrumProgram.vertexPositionAttribute );

  SpectrumProgram.OutcolorVec4 = ctx.getUniformLocation(SpectrumProgram, 'ourColor');
  SpectrumProgram.hue = ctx.getUniformLocation(SpectrumProgram, 'u_hue');
  SpectrumProgram.saturation = ctx.getUniformLocation(SpectrumProgram, 'u_saturation');
  SpectrumProgram.value = ctx.getUniformLocation(SpectrumProgram, 'u_value');
  SpectrumProgram.contrast = ctx.getUniformLocation(SpectrumProgram, 'u_contrast');
}

//
// Draw the scene.  
//
function drawSprctrum(gl, buffers,totalnum)
{
  var r = 0.;
  var g = 0.; 
  var b = 0.;
  gl.clearColor(r, g, b, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;// 0 = use the correct stride for type and numComponents
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers);
  gl.vertexAttribPointer(
      SpectrumProgram.vertexPositionAttribute,
      numComponents,
      type,
      normalize,
      stride,
      offset);
  gl.enableVertexAttribArray(
    SpectrumProgram.vertexPositionAttribute);
  
  //sleep(999);  
  //gl.useProgram(programInfo.program);
  
  //console.log("totalnum is:",totalnum);
  for (var i=0; i<totalnum; i+=2) //istart 2000+istart
  {
    gl.uniform4fv(SpectrumProgram.OutcolorVec4, [redValue, 1.0, blueValue, alpha]);
    //console.log("buffer number is:",buffers[i],buffers[i+1]);
    if (i<=totalnum/2) //1000+istart
    {
        redValue=redValue+0.002;
        blueValue=blueValue-0.002;
    }else
    {
        redValue=redValue-0.002;
        blueValue=blueValue+0.002;
    }
    alpha-=0.001;
    gl.lineWidth(1.5);
    gl.drawArrays(gl.LINES, i, 2);

  }
  
 // istart+=2000;
}