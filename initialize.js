var redValue = 0.0;
var greenValue = 0.0;
var blueValue = 1.0;
var PointredValue = 1.0;
var PointblueValue = 1.0;
var PointgreenValue = 0.0;

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
        //ctx.clearRect(0, 0, WIDTH, HEIGHT);
        InitArray();
        //console.log("arr data is:",arr);
        var Spectrumbuffers = Array2Buffers(ctx,arr);
        drawSprctrum(ctx, Spectrumbuffers,frequencyBins.length);
        var Pointbuffers = Array2Buffers(ctx,pointArr);
        drawPoint(ctx, Pointbuffers,frequencyBins.length);
        var wavebuffers = Array2Buffers(ctx,waveArr);
        drawWave(ctx, wavebuffers,dataArray.length);
    };
    function InitArray()
    {
        var xstart=-1.0;
        var delta =4.0/frequencyBins.length;// 0.002
        var j= 0;
        for (var i = 0; i < 6*frequencyBins.length;) 
        {
            value = frequencyBins[j];
            j++;
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
   
        }
        //point buffer
        xstart=-1.0;
        j=0;
        for (var i = 0; i < 6*frequencyBins.length;) 
        {
            value = frequencyBins[j];
            j++;
            h = (value / 255);
            pointArr[i++]=xstart;
            pointArr[i++]=-h;
            pointArr[i++]=0.0;
        
            pointArr[i++]=xstart;
            pointArr[i++]=h;
            pointArr[i++]=0.0;
            xstart=xstart+1.25*delta;
            if (xstart>1.0) 
            {
                xstart=-1.0;
            }
        }
        //wave buffer
        xstart=-1.0;
        j=0;
        var wavedelta = 4.0/dataArray.length;
        for (var i = 0; i < 3*dataArray.length;) 
        {
            value = dataArray[j];
            j++;
            h = value ;//(/ 255)
            waveArr[i++]=xstart;
            waveArr[i++]=-h;
            waveArr[i++]=0.0;
            xstart=xstart+0.5*wavedelta;
            if (xstart>1.0) 
            {
                xstart=-1.0;
            }
   
        }
    }
    function animate() {
        analyser.getByteFrequencyData(frequencyBins);
        // console.log(frequencyBins.indexOf(Math.max(...frequencyBins)), Math.max(...frequencyBins));

        analyser.getFloatTimeDomainData(dataArray);
        //analyser.getByteFrequencyData(buffer);
        // let pitchBuffer = buffer.slice(0);
        // for (var i = 0; i < pitchBuffer.length; i++) {                    
        //     pitchBuffer[i] = Math.log10(Math.abs(pitchBuffer[i]));
        // }


        /* RMS stands for Root Mean Square, basically the root square of the
        * average of the square of each value. */
        var rms = 0;
        for (var i = 0; i < dataArray.length; i++) {
            rms += dataArray[i] * dataArray[i];
        }
        rms = Math.sqrt(rms / (dataArray.length))
        // This will return the value in decibals.
        // var v = Math.abs(20 * Math.log10(rms));

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
  for (var i=0; i<totalnum; i+=2) //istart 2000+istart  256
  {
    //if(i%200==0)
    //  console.log("spectrum color is:",redValue,1.0,blueValue);
    gl.uniform4fv(SpectrumProgram.OutcolorVec4, [ redValue, greenValue, blueValue, alpha]);
    //console.log("buffer number is:",buffers);
    if (i< totalnum/2) //128
    {
      redValue=redValue+0.02;
      greenValue = greenValue + 0.03;
      blueValue=blueValue-0.02;
    }else
    {
      redValue=redValue-0.02;
      greenValue = greenValue -0.03;
      blueValue=blueValue+0.02;
    }
    alpha-=0.01;
    if(alpha == -0.01)
       alpha=1.0;
    gl.lineWidth(3.0);
    gl.drawArrays(gl.LINES, i, 2);

  }
  
  //console.log("spectrum color is:",redValue,1.0,blueValue);
}

function drawPoint(gl, buffers,totalnum)
{
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
  
  for (var i=0; i<totalnum; i++) 
  {
    
    gl.uniform4fv(SpectrumProgram.OutcolorVec4, [PointredValue,PointgreenValue, PointblueValue,alpha]);//PointgreenValue
    if (i< totalnum/2) 
    {
      PointredValue = PointredValue -0.04
      PointgreenValue=PointgreenValue+0.02;
      PointblueValue =PointblueValue-0.04;
    }else
    {
      PointredValue = PointredValue +0.04
      PointgreenValue=PointgreenValue - 0.02;
      PointblueValue=PointblueValue + 0.04;
    }
    alpha-=0.01;
    if(alpha == -0.01)
       alpha=1.0;
    gl.drawArrays(gl.POINTS, i, 1);
  }
}
//draw other two things
function drawWave(gl, buffers,totalnum)
{
  //var redValue = 0.0;
  //var blueValue = 1.0;
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
    for (var i=0; i<totalnum; i++) //istart 2000+istart  256
    {
      gl.uniform4fv(SpectrumProgram.OutcolorVec4, [ redValue, blueValue, 1.0 , 1.0]);
      //console.log("buffer number is:",buffers);
      if (i< totalnum/2) //128
      {
        redValue=redValue+0.002;
        blueValue=blueValue-0.002;
      }else
      {
        
        redValue=redValue-0.002;
        blueValue=blueValue+0.002;
      }
     // gl.lineWidth(1.5);
      gl.drawArrays(gl.POINTS, i, 1);
  
    }
}


// // creates a texture info { width: w, height: h, texture: tex }
// // The texture will start with 1x1 pixels and be updated
// // when the image has loaded
// function loadImageAndCreateTextureInfo(url) 
// {
//   var tex = gl.createTexture();
//   gl.bindTexture(gl.TEXTURE_2D, tex);
 
//   // let's assume all images are not a power of 2
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
 
//   var textureInfo = {
//     width: 1,   // we don't know the size until it loads
//     height: 1,
//     texture: tex,
//   };
//   var img = new Image();
//   img.addEventListener('load', function() {
//     textureInfo.width = img.width;
//     textureInfo.height = img.height;
 
//     gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
//     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
//   });
 
//   return textureInfo;
// }
 
// var textureInfos = [
//   loadImageAndCreateTextureInfo('./textures/spectrum_background.jpg'),
//   //loadImageAndCreateTextureInfo('resources/leaves.jpg'),
//   //loadImageAndCreateTextureInfo('resources/keyboard.jpg'),
// ];