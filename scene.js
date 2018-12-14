app.monkeyPositionTimer = 0;

function floatMonkey(){
  app.monkeyPositionTimer = app.monkeyPositionTimer > Math.PI * 2 ? 0 : app.monkeyPositionTimer + 0.05;
  app.monkey.position[Y] = Math.sin( app.monkeyPositionTimer ) / 1000;
}
app.monkeyRoomCollision = 3.95;
function roomCollisionCheck(){
  if( app.camera.position[X] > app.monkeyRoomCollision ){
    app.camera.position[X] = app.monkeyRoomCollision
  }
  if( app.camera.position[X] < -app.monkeyRoomCollision ){
    app.camera.position[X] = -app.monkeyRoomCollision
  }
  if( app.camera.position[Z] > app.monkeyRoomCollision ){
    app.camera.position[Z] = app.monkeyRoomCollision
  }
  if( app.camera.position[Z] < -app.monkeyRoomCollision ){
    app.camera.position[Z] = -app.monkeyRoomCollision
  }
}

function drawPlace(){
  floatMonkey();
  roomCollisionCheck();
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.01, 1000.0,app.pMatrix);
  //mat4.perspective(app.pMatrix,Math.PI*45/180, gl.viewportWidth / gl.viewportHeight, 0.01, 1000.0);
  //mat4.perspective( projection, fovyInRadians, aspect, near, far ); for version 2.2
  vec3.negate( app.camera.position, app.camera.inversePosition )
  
  mat4.identity( app.mvMatrix )
  // camera position and rotations
  mat4.rotate( app.mvMatrix, degToRad( app.camera.pitch ), [1,0,0] );
  // account for pitch rotation and light down vector
  mat4.multiplyVec3( app.mvMatrix, app.lightVectorStatic, app.lightVector )
  mat4.rotate( app.mvMatrix, degToRad( app.camera.heading ), [0,1,0] );
  mat4.translate( app.mvMatrix, app.camera.inversePosition );
  
  gl.useProgram( shaderProgram );
  
  mat4.multiplyVec3( app.mvMatrix, app.lightLocationStatic, app.lightLocation )
  gl.uniform3fv( shaderProgram.lightLocation, app.lightLocation );
  gl.uniform3fv( shaderProgram.lightVector, app.lightVector );
  
  setUniforms();
  
  mvPushMatrix();
     
    mat4.scale( app.mvMatrix, [2,2,2] )

    // Floor
    drawObject( app.models.room_floor, 0 );
    
    // Ceiling
    drawObject( app.models.room_ceiling, 0 );

    // Pedestal
    // drawObject( app.models.pedestal, 50, [0.75,0.75,0.75,1.0] );
      
      // Yellow sphere
      for (i = 0; i < 10; i++)
      {
        mvPushMatrix();
          mat4.scale( app.mvMatrix, [0.05,0.05,0.05] )
          mat4.rotate( app.mvMatrix, degToRad( 180 ), [0,1,0] );
          mat4.translate( app.mvMatrix, app.monkey.position );
          // mat4.translate( app.mvMatrix,  [0, 4, 0] );

          // Translate in x,z axis
          scl = 4;
          mat4.translate( app.mvMatrix,  [i * scl, 0, i * scl] );

          drawObject( app.models.tree, 0, [1, 1, 0, 1] );
          
        mvPopMatrix();
      }


      
      // Skylight
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