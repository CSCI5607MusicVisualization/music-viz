function drawPlace(){
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mat4.perspective(90, gl.viewportWidth / gl.viewportHeight, 0.01, 1000.0, app.pMatrix);
  
  vec3.negate( app.camera.position, app.camera.inversePosition )
  
  mat4.identity( app.mvMatrix )
  // camera position and rotations
  mat4.rotate( app.mvMatrix, degToRad( app.camera.pitch ), [1,0,0] );
  // account for pitch rotation and light down vector
  app.lightVector.splice(0,app.lightVector.length);
  var CurlightVector = new Array();
  var lightVector = vec3.create();
  for(var i=0;i<app.lightLocationStatic.length/3;++i)
  {
    CurlightVector[0] = app.lightVectorStatic[3*i];
    CurlightVector[1] = app.lightVectorStatic[3*i+1];
    CurlightVector[2] = app.lightVectorStatic[3*i+2];
    mat4.multiplyVec3( app.mvMatrix, CurlightVector, lightVector );
    app.lightVector[3*i] = lightVector[0];
    app.lightVector[3*i+1] = lightVector[1];
    app.lightVector[3*i+2] = lightVector[2];
  }
  mat4.rotate( app.mvMatrix, degToRad( app.camera.heading ), [0,1,0] );
  mat4.translate( app.mvMatrix, app.camera.inversePosition );
  
  gl.useProgram( shaderProgram );
 
  // To add multiple lights append to and of array of light locations

  var CurlightLocation = new Array();
  
  var lightLocation = vec3.create();
  
  //clear
  app.lightLocation.splice(0,app.lightLocation.length);
 
  for(var i=0;i<app.lightLocationStatic.length/3;++i)
  {
    CurlightLocation[0] = app.lightLocationStatic[3*i];
    CurlightLocation[1] = app.lightLocationStatic[3*i+1];
    CurlightLocation[2] = app.lightLocationStatic[3*i+2];
    mat4.multiplyVec3( app.mvMatrix, CurlightLocation, lightLocation);
    app.lightLocation[3*i] = lightLocation[0];
    app.lightLocation[3*i+1] = lightLocation[1];
    app.lightLocation[3*i+2] = lightLocation[2];
    //app.lightLocation =app.lightLocation.concat(lightLocation);
    //app.lightVector =app.lightVector.concat(lightVector);
  }

   //mat4.multiplyVec3( app.mvMatrix, app.lightVectorStatic, app.lightVector );
  //mat4.multiplyVec3( app.mvMatrix, app.lightLocationStatic, app.lightLocation );
  gl.uniform3fv( shaderProgram.lightLocation,app.lightLocation);// app.lightLocationStatic 
  gl.uniform3fv( shaderProgram.lightVector,app.lightVector );// app.lightVectorStatic
  gl.uniform1fv( shaderProgram.lightIntensity, app.lightSourceIntensity);
  gl.uniform1i( shaderProgram.lightCount, app.Lightcount);
  gl.uniform1f( shaderProgram.lightcone, 0.5);//90 degree
  
  setUniforms();

  function getRandomInt(min, max)
  // Returns a random integer
  {
    return Math.floor( Math.random() * (max - min + 1) ) << 0;
  }


  var dt = app.elapsed / 1000;
  // Root transform start
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
            mat4.scale( app.mvMatrix, [app.xwidth / 2, app.spectrum[i] * 2, app.zwidth] )       
            mat4.translate( app.mvMatrix,  [0 - i * 1.3, 0 + 1, 0] );

            drawObject( app.models.cube, 0, [(255-i)/255, 0, (255 - (255 - i)) / 255, 1] );         
            
            // drawObject( app.models.cube, 0,  [.3, .3, .3, 1]);         
            // Original color:
            // [(255-i)/255, 0, (255 - (255 - i)) / 255, 1]  
          
          mvPopMatrix(); 
        }
        mat4.translate( app.mvMatrix, app.monkey.position );
        mat4.translate( app.mvMatrix,  [0, 2.5, 0] );
      mvPopMatrix();
    
    // Draw floor
    mvPushMatrix();
      mat4.scale( app.mvMatrix, [4,2,2] )

      // Color the ground a darker shade of green
      drawObject( app.models.room_floor, 0, [1, 1, 1, 0.8] );

    mvPopMatrix();
    
    mvPushMatrix();
      mat4.scale( app.mvMatrix, [1, 0.05, 0.2] )
      mat4.translate( app.mvMatrix, app.monkey.position);      
      for (let i = 0; i < app.enviromental.num; i++) {
        mvPushMatrix();
          if (app.enviromental[i].loc[2] < -1.0) {
            app.enviromental[i].loc[2] = 30;
          }
          mat4.translate( app.mvMatrix,  [app.enviromental[i].loc[0], app.enviromental[i].loc[2] + 70, app.enviromental[i].loc[1]] );              
          drawObject( app.models.cube, 0, [1, 1, 1, 1] );                   
          // app.enviromental[i].loc[2] -=  20 * dt;          
        mvPopMatrix();            
      }
    mvPopMatrix();    

    mvPushMatrix();
      mat4.scale( app.mvMatrix, [0.005, 0.005, 0.005] )
      mat4.translate( app.mvMatrix, app.monkey.position);      
      for (let i = 0; i < app.particle.num; i++) {
        mvPushMatrix();
          if (app.particle[i].loc[2] < -1.0) {
            app.particle[i].loc[2] = 3000;          
          }
          // console.log(app.particle[i].loc[2]);
          mat4.translate( app.mvMatrix,  [app.particle[i].loc[0] - i + 500, app.particle[i].loc[2], app.particle[i].loc[1]] );              
          drawObject( app.models.cube, 0, [1, 1, 1, 0.7] );                   
          // console.log(app.particle[i].loc[2]);                    
          app.particle[i].loc[2] -=  10;
          // console.log(app.particle[i].loc[2]);          
        mvPopMatrix();            
      }
    mvPopMatrix();    
    // Rocks
    mvPushMatrix();
      mat4.scale( app.mvMatrix, [0.05, 0.05, 0.05] )
      mat4.translate( app.mvMatrix, app.monkey.position);      
      for (let i = 0; i < app.rocks.num; i++) {
        mvPushMatrix();
          mat4.translate( app.mvMatrix,  [app.rocks[i].loc[0] * i, app.rocks[i].loc[2], app.rocks[i].loc[1]] );              
          drawObject( app.models.rock1, 0, [165/255, 42/255, 42/255, 1] );                   
        mvPopMatrix();            
      }
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
            // drawObject( app.models.treeLrg, 0, [1, 0, 0, 1] );
            drawObject( app.models.treeLrg, 0, [0, 1-app.intensity, 0, 1] );
          }

          else if (shrub.type == 1)
          {
            // drawObject( app.models.treeSml, 0, [0, 1, 0, 1] );
            drawObject( app.models.treeSml, 0, [app.intensity, 0, 1-app.intensity, 1] );
          }
          else if (shrub.type == 2)
          {
            // drawObject( app.models.treeMed, 0, [0, 0, 1, 1] );
            drawObject( app.models.treeMed, 0, [1-app.intensity, 0, app.intensity, 1] );
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
