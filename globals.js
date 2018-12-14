// globals

// Enums
var X = 0, Y = 1, Z = 2, H = 3, P = 4;
// gl context
var gl;
var ctx;
var glbox;
// the canvas we're working with
var canvas;
var SpecCanvas;
// application var holder
var app = {};
  // Color Ramps
  app.specular = {};
  app.diffuse = {};  
  // mesh holder
  app.meshes = {};
  // model holder
  app.models = {};
  // this model has a single texture image,
  // so there is no need to have more than one
  // texture holder
  app.textures = {};
  // keyboard key ids
  app.keys = { W: 87, A: 65, S: 83, D: 68 };
  app.keys.pressed = {};
  for( key in app.keys ){
    app.keys.pressed[ app.keys[ key ] ] = false;
  }
  // camera
  app.camera = {};
  app.camera.position = [0,0.3,3.7];
  app.camera.inversePosition = vec3.create();
  app.camera.heading = 0;
  app.camera.pitch = 0;
  app.camera.walkSpeed = 0.001;
  app.camera.runSpeed = 0.002;
  app.camera.speed = app.camera.walkSpeed;
  app.camera.sensitivity = 10;
  app.camera.disable = false;
  app.camera.shake = false;
  app.camera.shakeTimer = 0;
  app.camera.shakeFrequency = 100;
  app.camera.shakeAmplitude = 0.01;
  // matrices
  app.elapsed = 0;
  // which function to use to draw
  app.drawScene;
  app.scenechange = false;
  // room light
  app.lightLocationStatic = [0,15,0];
  app.lightVectorStatic = [0, -1, 0];
  app.lightLocation = vec3.create();
  app.lightVector = vec3.create();
  app.ambientIntensity = 1.0;
  app.diffuseIntensity = 2.0;
  app.mvMatrix = mat4.create();
  app.mvMatrixStack = [];
  app.pMatrix = mat4.create();
  // animation references
  app.lastTime = 0;
  app.elapsed = 0;
  // which function to use to draw
  app.drawScene;
  app.scenechange = false;
  // room light
  // app.lightLocationStatic = [0,2,0];
  // app.lightVectorStatic = [0,-1,0];
  // app.lightLocation = vec3.create();
  // app.lightVector = vec3.create();
  // app.ambientIntensity = 0.8;
  // app.diffuseIntensity = 2.0;
  // monkey
  app.monkey = {};
  app.monkey.position = [0,0,0]

var ShaderProgram;

/*------------------spectrum------------ */

var SpectrumProgram;
/*------------------skybox------------ */
var SkyboxProgram;