app.monkeyPositionTimer = 0;

function floatMonkey(){
  app.monkeyPositionTimer = app.monkeyPositionTimer > Math.PI * 2 ? 0 : app.monkeyPositionTimer + 0.05;
  app.monkey.position[Y] = Math.sin( app.monkeyPositionTimer ) / 1000;
}
// app.monkeyRoomCollision = 3.95;
// function roomCollisionCheck(){
//   if( app.camera.position[X] > app.monkeyRoomCollision ){
//     app.camera.position[X] = app.monkeyRoomCollision
//   }
//   if( app.camera.position[X] < -app.monkeyRoomCollision ){
//     app.camera.position[X] = -app.monkeyRoomCollision
//   }
//   if( app.camera.position[Z] > app.monkeyRoomCollision ){
//     app.camera.position[Z] = app.monkeyRoomCollision
//   }
//   if( app.camera.position[Z] < -app.monkeyRoomCollision ){
//     app.camera.position[Z] = -app.monkeyRoomCollision
//   }
// }

function drawPlace(){
  floatMonkey();
  // roomCollisionCheck();
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.01, 1000.0, app.pMatrix);
  
  vec3.negate( app.camera.position, app.camera.inversePosition )
  
  mat4.identity( app.mvMatrix )
  // camera position and rotations
  mat4.rotate( app.mvMatrix, degToRad( app.camera.pitch ), [1,0,0] );
  // account for pitch rotation and light down vector
  mat4.multiplyVec3( app.mvMatrix, app.lightVectorStatic, app.lightVector )
  mat4.rotate( app.mvMatrix, degToRad( app.camera.heading ), [0,1,0] );
  mat4.translate( app.mvMatrix, app.camera.inversePosition );
  
  gl.useProgram( shaderProgram );


  // To add multiple lights append to and of array of light locations
  mat4.multiplyVec3( app.mvMatrix, app.lightLocationStatic, app.lightLocation );
  gl.uniform3fv( shaderProgram.lightLocation, app.lightLocation );
  gl.uniform3fv( shaderProgram.lightVector, app.lightVector );
  gl.uniform1i( shaderProgram.lightCount, 2);
  
  setUniforms();
  // console.log(app.spectrum);
  mvPushMatrix();
    mat4.scale( app.mvMatrix, [2,2,2] )
    // THIS IS A SINGLE OBJECT
    // drawObject( app.models.room_walls, 0 );
    // if( !app.breakWalls ) {
      // drawObject( app.models.room_wall_unbroken, 0 );
    // }
    // drawObject( app.models.room_floor, 0 );
    // drawObject( app.models.room_ceiling, 0 );
    drawObject( app.models.pedestal, 50, [0.75,0.75,0.75,1.0] );
      mvPushMatrix();
        mat4.scale( app.mvMatrix, [0.0025,0.05,0.025] )
        mat4.rotate( app.mvMatrix, degToRad( 180 ), [0,1,0] );
        mat4.translate( app.mvMatrix,  [250, 10, 0] );        
        for (let i = 0; i < app.spectrum.length; i++) {
          let r = 1, g = 0, b = 0;

          mvPushMatrix();
            mat4.scale( app.mvMatrix, [1, app.spectrum[i], 1] )       
            mat4.translate( app.mvMatrix, app.monkey.position);
            mat4.translate( app.mvMatrix,  [0 - i * 2, 0 + 1, 0] );              
            drawObject( app.models.cube, 0, [r, g, b, 1] );         
          mvPopMatrix();        
        }
        mat4.translate( app.mvMatrix, app.monkey.position );
        mat4.translate( app.mvMatrix,  [0, 2.5, 0] );
        drawObject( app.models.tree01, 0, [1, 1, 0, 1] );
      mvPopMatrix();
    

      mvPushMatrix();
        mat4.translate( app.mvMatrix, [0,2,0] );
        gl.uniform3fv( shaderProgram.ambientColorUniform, lightIntesity( 2.0, 1,1,1 ) );
        drawObject( app.models.skylight, 0, [0.53,0.81,0.98,1.0] );
        gl.uniform3fv( shaderProgram.ambientColorUniform, lightIntesity( app.ambientIntensity, 0.3,0.3,0.3 ) );
      mvPopMatrix();
    
    drawObject( app.models.room_tunnel_ceiling, 0 );
    drawObject( app.models.room_tunnel_walls, 0 );
  mvPopMatrix();
}

app.drawScene = drawPlace;