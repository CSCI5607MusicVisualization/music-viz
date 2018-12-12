// INITIALIZE DEPENDANCIES
//var fs = require('fs');

//var OBJ = require('webgl-obj-loader');


var cubeRotation = 0.0;
var rms = 0.0;
var r = 0.;
var g = 0.;
var b = 0.;

const SpectrumvsSource =
`
#version 330 core
attribute vec3 aPos;
 
void main()
{
    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
}
`;
const SpectrumfsSource=`
#version 330 core

out vec4 FragColor;

uniform vec4 ourColor;

uniform float u_hue=121.0;
uniform float u_saturation=2.0;
uniform float u_value=1.0;
uniform float u_contrast=1.0;

vec3 rgbtohsv(vec3 rgb)
{
    float R = rgb.x;
    float G = rgb.y;
    float B = rgb.z;
    vec3 hsv;
    float max1 = max(R, max(G, B));
    float min1 = min(R, min(G, B));
    if (R == max1)
    {
        hsv.x = (G - B) / (max1 - min1);
    }
    if (G == max1)
    {
        hsv.x = 2.0 + (B - R) / (max1 - min1);
    }
    if (B == max1)
    {
        hsv.x = 4.0 + (R - G) / (max1 - min1);
    }
    hsv.x = hsv.x * 60.0;
    if (hsv.x < 0.0)
    {
        hsv.x = hsv.x + 360.0;
    }
    hsv.z = max1;
    hsv.y = (max1 - min1) / max1;
    return hsv;
}
vec3 hsvtorgb(vec3 hsv)
{
    float R;
    float G;
    float B;
    if (hsv.y == 0.0)
    {
        R = G = B = hsv.z;
    }
    else
    {
        hsv.x = hsv.x / 60.0;
        int i = int(hsv.x);
        float f = hsv.x - float(i);
        float a = hsv.z * (1.0 - hsv.y);
        float b = hsv.z * (1.0 - hsv.y * f);
        float c = hsv.z * (1.0 - hsv.y * (1.0 - f));
        if (i == 0)
        {
            R = hsv.z;
            G = c;
            B = a;
        }
        else if (i == 1)
        {
            R = b;
            G = hsv.z;
            B = a;
        }
        else if (i == 2)
        {
            R = a;
            G = hsv.z;
            B = c;
        }
        else if (i == 3)
        {
            R = a;
            G = b;
            B = hsv.z;
        }
        else if (i == 4)
        {
            R = c;
            G = a;
            B = hsv.z;
        }
        else
        {
            R = hsv.z;
            G = a;
            B = b;
        }
    }
    return vec3(R, G, B);
}
void main()
{
    
    vec4 pixColor = ourColor;
    vec3 hsv;
    hsv.xyz = rgbtohsv(pixColor.rgb);
    hsv.x += u_hue;
    hsv.x = mod(hsv.x, 360.0);
    hsv.y *= u_saturation;
    hsv.z *= u_value;
    vec3 f_color = hsvtorgb(hsv);
    f_color = ((f_color - 0.5) * max(u_contrast+1.0, 0.0)) + 0.5;
    
    FragColor = vec4(f_color, pixColor.a);
    
    //FragColor = ourColor*vec4(1.0,1.0,1.0,0.5);
}
`;
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



//
// Start here
//
function main() {

  window.onload = function () {
    //var meshPath = './models/tree01.obj';
    
    // fs.readFile(__dirname + '/models/tree01.obj', 'utf8', function (err, data) {
    //   if (err) return console.error(err);
    //   var mesh = new OBJ.Mesh(data);
    //   console.log(mesh);
    // });

    var ctx = document.getElementById("canvas").getContext("2d");
    if (!ctx) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }
    const SpectrumProgram = initShaderProgram(ctx, SpectrumvsSource, SpectrumfsSource);
    const SpectrumInfo = 
    {
      program: SpectrumProgram,
      attribLocations: 
      {
        vertexPosition: ctx.getAttribLocation(SpectrumProgram, 'aPos'),
      },
      uniformLocations: {
        OutcolorVec4: ctx.getUniformLocation(SpectrumProgram, 'ourColor'),
        hue: ctx.getUniformLocation(SpectrumProgram, 'u_hue'),
        saturation: ctx.getUniformLocation(SpectrumProgram, 'u_saturation'),
        value: ctx.getUniformLocation(SpectrumProgram, 'u_value'),
        contrast: ctx.getUniformLocation(SpectrumProgram, 'u_contrast'),
      },
    };
    
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
      request.open('GET', '../viper.ogg', true);
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
    const NUM=1000;
    var k=0;
    var arr = new Array();
    // function draw() {
    //     ctx.clearRect(0, 0, WIDTH, HEIGHT);
    //     // console.log(meter.volume)
    //     for (var i = 0; i < frequencyBins.length; i++) {
    //         value = frequencyBins[i];
    //         h = HEIGHT * (value / 255);
    //         w = WIDTH / frequencyBins.length;
    //             ctx.fillStyle = `rgb(${Math.random() * w},${Math.random() * h},${Math.random() * w})`;
    //         ctx.fillRect(i * w, HEIGHT - 1, w, -h);
    //     }
    // };
    function GenerateDate()
    {
      var temp =sqrt(out[j][0]*out[j][0]+out[j][1]*out[j][1])/30000;
        j++;
        
        arr[i++]=R*cos(2*PI/NUM*k);     
        arr[i++]=R*sin(2*PI/NUM*k);
        arr[i++]=0.0;
        
        arr[i++]=(R+temp)*cos(2*PI/NUM*k);     
        arr[i++]=(R+temp)*sin(2*PI/NUM*k);
        arr[i++]=0.0;
        
        k++;
        if (k>NUM) {
            k=0;     
        }
    }
   // const buffers = initSpectrumBuffers(ctx,)
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
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
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
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}


// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initSpectrumBuffers(gl,spec)
{
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spec), gl.STATIC_DRAW);
  return {
    position: positionBuffer,
  };
}
function initBuffers(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

  const faceColors = [
    // [r, g, b,  1.0],    // Front face: white
    // [r, g, b,  1.0],    // Front face: white
    // [r, g, b,  1.0],    // Front face: white
    // [r, g, b,  1.0],    // Front face: white
    // [r, g, b,  1.0],    // Front face: white
    // [r, g, b,  1.0],    // Front face: white

    [1., 1., 1., 1.0],    // Front face: white
    [1., 1., 1., 1.0],    // Front face: white
    [1., 1., 1., 1.0],    // Front face: white
    [1., 1., 1., 1.0],    // Front face: white
    [1., 1., 1., 1.0],    // Front face: white
    [1., 1., 1., 1.0],    // Front face: white
  

    // [1.0,  1.0,  1.0,  1.0],    // Front face: white
    // [1.0,  0.0,  0.0,  1.0],    // Back face: red
    // [0.0,  1.0,  0.0,  1.0],    // Top face: green
    // [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    // [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    // [1.0,  0.0,  1.0,  1.0],    // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.

  var colors = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

//
// Draw the scene.
//
function drawSprctrum(gl, programInfo, buffers, deltaTime)
{
  gl.clearColor(r, g, b, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;// 0 = use the correct stride for type and numComponents
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  gl.useProgram(programInfo.program);
  var redValue = 0.0;
  var blueValue = 1.0;
  var alpha = 1.0;

  for (var i=istart; i<2000+istart; i+=2) {
      
      glUniform4f(programInfo.uniformLocations.OutcolorVec4, redValue, 1.0, blueValue, alpha);
      
      if (i<=1000+istart) 
      {
          redValue=redValue+0.002;
          blueValue=blueValue-0.002;
      }else{
          redValue=redValue-0.002;
          blueValue=blueValue+0.002;
      }
      alpha-=0.001;
      
      glDrawArrays(GL_LINES, i, 2);

  }
  
  istart+=2000;
}
function drawScene(gl, programInfo, buffers, deltaTime) {
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

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const vertexCount = 36;
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
