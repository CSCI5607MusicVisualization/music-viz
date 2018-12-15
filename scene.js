app.monkeyPositionTimer = 0;

function floatMonkey(){
  app.monkeyPositionTimer = app.monkeyPositionTimer > Math.PI * 2 ? 0 : app.monkeyPositionTimer + 0.05;
  app.monkey.position[Y] = Math.sin( app.monkeyPositionTimer ) / 1000;
}



function drawPlace(){
  floatMonkey();
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mat4.perspective(90, gl.viewportWidth / gl.viewportHeight, 0.01, 1000.0, app.pMatrix);
  
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






  function getRandomInt(min, max)
  // Returns a random integer
  {
    return Math.floor( Math.random() * (max - min + 1) ) << 0;
  }

  
  // Root transform START
  // ===============================================
  mvPushMatrix();

    mat4.scale( app.mvMatrix, [2,2,2] )

      mvPushMatrix();

        mat4.scale( app.mvMatrix, [0.025,0.5,0.025] )
        mat4.rotate( app.mvMatrix, degToRad( 180 ), [0,1,0] );
        mat4.translate( app.mvMatrix,  [100, 0, 100] );


        for (let i = 0; i < app.spectrum.length; i++) {
        // Draw spectrum


          // ORIGINAL
          // mvPushMatrix();
          //   mat4.scale( app.mvMatrix, [1, app.spectrum[i] * .5, 1] )       
          //   mat4.translate( app.mvMatrix, app.monkey.position);
          //   mat4.translate( app.mvMatrix,  [0 - i * 1.3, 0 + 1, 0] );              
          //   drawObject( app.models.cube, 0, [(255-i)/255, 0, (255 - (255 - i)) / 255, 1] );         
          // mvPopMatrix();
          
            mvPushMatrix();
            mat4.translate( app.mvMatrix, app.monkey.position);
            mat4.translate( app.mvMatrix, [300, 0, 0] );
            mat4.scale( app.mvMatrix, [app.xwidth / 2, app.spectrum[i] * 1.3, app.zwidth] )       
            mat4.translate( app.mvMatrix,  [0 - i * 1.3, 0 + 1, 0] );


            drawObject( app.models.cube, 0,  [.3, .3, .3, 1]);         
            // Original color:
            // [(255-i)/255, 0, (255 - (255 - i)) / 255, 1]  
          
          mvPopMatrix(); 
        }
        mat4.translate( app.mvMatrix, app.monkey.position );
        mat4.translate( app.mvMatrix,  [0, 2.5, 0] );
      mvPopMatrix();
    
    // Draw floor
    mvPushMatrix();
      mat4.scale( app.mvMatrix, [2,2,2] )
      // Color the ground a darker shade of green
      drawObject( app.models.room_floor, 0, [0, 0.1, 0, .8] );
    mvPopMatrix();

    // Push the model matrix for trees
    mvPushMatrix();

      mat4.scale( app.mvMatrix, [0.15, 0.05, 0.05] )
      mat4.rotate( app.mvMatrix, degToRad( 180 ), [0,1,0] );

      for (i = 0; i < app.shrubbery.num; i++)
      // Generate random shrubbery.  Objects defined in `globals.js`
      {

        // Pick the current shrub
        shrub = app.shrubbery[i];

        // mat4.scale( app.mvMatrix, [0.5, 1, 0.5] );
        mvPushMatrix();

          // Scale trees to be a bit bigger
          mat4.scale( app.mvMatrix, [3, 6, 3] );

          // console.log(shrub.loc[0], shrub.loc[1])
          // console.log(shrub.type)
          mat4.translate( app.mvMatrix,  [ shrub.loc[0], 0, shrub.loc[1] ] );
          // mat4.translate( app.mvMatrix,  [ app.shrubbery.locations[i][0], 0, app.shrubbery.locations[i][1] ] );

          // Actually draw tree
          // TODO: All of this cross-referencing with the trees across files is becoming a headache

          // The index of the tree is hard-coded here
          if (shrub.type == 0)
          {
            drawObject( app.models.treeLrg, 0, [1, 0, 1, 1] );
            // drawObject( app.models.treeLrg, 0, [1, 1, 0, 1] );
          }

          else if (shrub.type == 1)
          {
            drawObject( app.models.treeSml, 0, [1, 1, 0, 1] );
            // drawObject( app.models.treeSml, 0, [app.intensity, app.intensity, 0, 1] );
          }
          else if (shrub.type == 2)
          {
            drawObject( app.models.treeMed, 0, [0, 1, 1, 1] );
            // drawObject( app.models.treeMed, 0, [app.intensity, app.intensity, 0, 1] );
          }

          else
          {
            console.log("Cant draw");
          }


        mvPopMatrix();        
      }

    mvPopMatrix();
    

    mvPushMatrix();
      mat4.translate( app.mvMatrix, [0,2,0] );
      gl.uniform3fv( shaderProgram.ambientColorUniform, lightIntesity( 2.0, 1,1,1 ) );
      // drawObject( app.models.skylight, 0, [0.53, 0.81, 0.98, 1.0] );
      gl.uniform3fv( shaderProgram.ambientColorUniform, lightIntesity( app.ambientIntensity, 0.3,0.3,0.3 ) );
    mvPopMatrix();
    
    // Old tunnel stuff
    // drawObject( app.models.room_tunnel_ceiling, 0 );
    // drawObject( app.models.room_tunnel_walls, 0 );

  // Root transform END
  // ===============================================
  mvPopMatrix();
}

app.drawScene = drawPlace;
