
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
// function initBkgnd() {
//   backTex = gl.createTexture();
//   backTex.Img = new Image();
//   backTex.Img.onload = function() {
//       handleBkTex(backTex);
//   }
//   backTex.Img.src = "./textures/spectrum_background.jpg";
// }

// function handleBkTex(tex) {
//   ctx.bindTexture(ctx.TEXTURE_2D, tex);
//   ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
//   ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, tex.Img);
//   ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
//   ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
//   ctx.bindTexture(ctx.TEXTURE_2D, null);
// }
$(document).ready(function(){
  obj_utils.downloadMeshes({
      'room_floor': 'models/room_floor.obj',
      'cube': 'models/cube.obj',
      // Shrubbery.
      // WARNING: These values are also referenced in globals.js
      'treeLrg': 'models/shrubbery/tree01.obj',
      'treeSml': 'models/shrubbery/tree02.obj',
      'treeMed': 'models/shrubbery/tree03.obj',

      'bushes': 'models/shrubbery/bushes.obj',
      'rock1': 'models/shrubbery/boulder.obj'
    },
    webGLStart
  );
});

