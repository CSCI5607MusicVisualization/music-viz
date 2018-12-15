
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
  //initBkgnd();
  animate();
}

function webGLStart( meshes ) {
  app.meshes = meshes;
  canvas = document.getElementById("mycanvas");
  SpecCanvas = document.getElementById("canvas");
  initGL(canvas,SpecCanvas);
  initShaders();
  initAudio();
  initBuffers();
  initPointerLock();
  initTextures();
  
  document.onkeydown = cameraKeyDownHandler;
  document.onkeyup = cameraKeyUpHandler;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  //ctx.clearColor(0.0, 0.0, 0.0, 1.0);
  //initBkgnd();
  //ctx.enable(gl.DEPTH_TEST);
  
  tick();
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
      'cube': 'models/cube.obj',
      'pedestal': 'models/pedestal.obj',
      'boulder': 'models/boulder.obj',
      
      // Shrubbery.
      // WARNING: These values are also referenced in globals.js
      'treeLrg': 'models/shrubbery/tree01.obj',
      'treeSml': 'models/shrubbery/tree02.obj',
      'treeMed': 'models/shrubbery/tree03.obj',

      'bushes': 'models/shrubbery/bushes.obj'
    },
    webGLStart
  );
});

