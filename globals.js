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
  app.camera.heading = 20;
  app.camera.pitch = -25;
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
  app.lightLocationStatic = new Array();
  app.lightVectorStatic = new Array();
  app.lightLocation = new Array();
  app.lightVector = new Array();
  app.lightSourceIntensity = new Array();
  /**----------------here to add light sources -------------------*/
  app.Lightcount=3;
  app.lightLocationStatic.push(0, 45, 0);
  app.lightVectorStatic.push(0, -1, 0);
  app.lightSourceIntensity.push(10.0);

  app.lightLocationStatic.push(-45, 45,0 );
  app.lightVectorStatic.push(1, -1,0 );
  app.lightSourceIntensity.push(10.0);

  app.lightLocationStatic.push(45, 45,0 );
  app.lightVectorStatic.push(-1, -1,0 );
  app.lightSourceIntensity.push(10.0);

  // app.lightLocationStatic = [0, 45, 0];
  // app.lightVectorStatic = [0, -1, 0];
  // app.lightLocation = vec3.create();
  // app.lightVector = vec3.create();

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
  // // room light
  // // app.lightLocationStatic = [0,2,0, -0.5, 2, 0];
  // // app.lightVectorStatic = [0,-1,0, 0, -1, 0];
  // // app.lightLocation = vec3.create();
  // // app.lightVector = vec3.create();
  // app.ambientIntensity = 0.8;
  // app.diffuseIntensity = 2.0;
  // monkey
  app.monkey = {};
  app.monkey.position = [0,0,0]
  app.intensity = 0;
  app.spectrum = [];
  app.point = [];
  app.wave = [];
  
  var ShaderProgram;
/*------------------spectrum------------ */
var BackgroundProgram = {};
var SpectrumProgram;




// Scenery globals
// ===============
// Store the current RMS value
app.intensity = 0;
app.xwidth = 30;
app.zwidth = 10;



// Trees
// ===============


function getRandomXZ(minx, maxx, minz, maxz)
// Returns X and Z coordinates within the ranges of x,z specified
{
  x = Math.random() * (maxx - minx) + minx;
  z = Math.random() * (maxz - minz) + minz;

  return [x, z];
}

function getRandomInt(min, max)
// Returns a random integer
// Used here to get the index of a random shrubbery object file
{
  return Math.floor( Math.random() * (max - min + 1) ) << 0;
}


// Populate a shrubbery object
app.shrubbery = {}
app.shrubbery.num = 200;

// The number of object files that are initialized in  `webgl.js`
app.shrubbery.objFileCount = 3;

for (i = 0; i < app.shrubbery.num; i++)
// Generate tree locations
{
  // Create an empty shrub object
  app.shrubbery[i] = {}

  // Generate its location
  app.shrubbery[i]['loc'] = getRandomXZ( -app.xwidth / 2, app.xwidth / 2, -app.zwidth * .6, app.zwidth );
  
  // Generate  random type
  app.shrubbery[i]['type'] = getRandomInt(0, app.shrubbery.objFileCount - 1);
}

console.log(app.shrubbery)

// DEBUG
// console.log(app.shrubbery.locations)

// Populate a shrubbery object
app.enviromental = {}
app.enviromental.num = 1000;
for (i = 0; i < app.enviromental.num; i++)
  // Generate tree locations
  {
    // Create an empty shrub object
    app.enviromental[i] = {}
    // Generate its location
    app.enviromental[i]['loc'] = getRandomXZ(-30, 30, -5, 10);
    app.enviromental[i]['loc'][2] = 30;    
  }

// Populate a shrubbery object
app.particle = {}
app.particle.num = 1000;
for (i = 0; i < app.particle.num; i++)
  // Generate tree locations
  {
    // Create an empty shrub object
    app.particle[i] = {}
    // Generate its location
    app.particle[i]['loc'] = getRandomXZ(-30, 300, -5, 100);
    // console.log(app.particle[i]['loc']);
    app.particle[i]['loc'][2] = Math.floor(Math.random() * (3000 - 300) + 300);
    // console.log(app.particle[i]['loc'][2])
  }


// Populate a Rock objects
app.rocks = {}
app.rocks.num = 100;
for (i = 0; i < app.rocks.num; i++)
  // Generate tree locations
  {
    // Create an empty shrub object
    app.rocks[i] = {}
    // Generate its location
    app.rocks[i]['loc'] = getRandomXZ(-10, 10, -50, 10);
    app.rocks[i]['loc'][2] = -1;    
  }



