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
  drawSkybox();
  animate();
}

function webGLStart( meshes ) 
{
  app.meshes = meshes;
  canvas = document.getElementById("mycanvas");
  SpecCanvas = document.getElementById("canvas");
  initGL(canvas,SpecCanvas);

  initShaders();
  initAudio();
  initBuffers();
  initPointerLock();
  initTextures();
  
  initSkyboxShaders(gl);
  initSyboxBuffers(canvas,SkyboxProgram);
  setupSkybox();

  document.onkeydown = cameraKeyDownHandler;
  document.onkeyup = cameraKeyUpHandler;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

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
      'suzanne': 'models/boulder.obj',
      'pedestal': 'models/pedestal.obj',
      'boulder': 'models/boulder.obj',
      'tree01': 'models/suzanne.obj',
      // Tree
      'tree': 'models/tree01.obj'
    },
    webGLStart
  );
});

