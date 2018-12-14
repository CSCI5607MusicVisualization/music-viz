glArrayType = typeof Float32Array !="undefined" ? Float32Array : ( typeof WebGLFloatArray != "undefined" ? WebGLFloatArray : Array );
var canvas; 
var gl; 
// function IdentityMat44() {
//   var m = new glArrayType(16);
//   m[0]  = 1; m[1]  = 0; m[2]  = 0; m[3]  = 0;
//   m[4]  = 0; m[5]  = 1; m[6]  = 0; m[7]  = 0;
//   m[8]  = 0; m[9]  = 0; m[10] = 1; m[11] = 0;
//   m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
//   return m;
// };

// function RotateAxis(matA, angRad, axis) {
//     var aMap = [ [1, 2], [2, 0], [0, 1] ];
//     var a0 = aMap[axis][0], a1 = aMap[axis][1]; 
//     var sinAng = Math.sin(angRad), cosAng = Math.cos(angRad);
//     var matB = new glArrayType(16);
//     for ( var i = 0; i < 16; ++ i ) matB[i] = matA[i];
//     for ( var i = 0; i < 3; ++ i ) {
//         matB[a0*4+i] = matA[a0*4+i] * cosAng + matA[a1*4+i] * sinAng;
//         matB[a1*4+i] = matA[a0*4+i] * -sinAng + matA[a1*4+i] * cosAng;
//     }
//     return matB;
// }

// function Cross( a, b ) { return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0], 0.0 ]; }
// function Dot( a, b ) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
// function Normalize( v ) {
//     var len = Math.sqrt( v[0] * v[0] + v[1] * v[1] + v[2] * v[2] );
//     return [ v[0] / len, v[1] / len, v[2] / len ];
// }

// var Camera = {};
// Camera.create = function() {
//     this.pos    = [0, 5, 0.0];
//     this.target = [0, 0, 0];
//     this.up     = [0, 0, 1];
//     this.fov_y  = 90;
//     this.vp     = [800, 600];
//     this.near   = 0.5;
//     this.far    = 100.0;
// }
// Camera.Perspective = function() {
//     var fn = this.far + this.near;
//     var f_n = this.far - this.near;
//     var r = this.vp[0] / this.vp[1];
//     var t = 1 / Math.tan( Math.PI * this.fov_y / 360 );
//     var m = IdentityMat44();
//     m[0]  = t/r; m[1]  = 0; m[2]  =  0;                              m[3]  = 0;
//     m[4]  = 0;   m[5]  = t; m[6]  =  0;                              m[7]  = 0;
//     m[8]  = 0;   m[9]  = 0; m[10] = -fn / f_n;                       m[11] = -1;
//     m[12] = 0;   m[13] = 0; m[14] = -2 * this.far * this.near / f_n; m[15] =  0;
//     return m;
// }
// Camera.LookAt = function() {
//     var mz = Normalize( [ this.pos[0]-this.target[0], this.pos[1]-this.target[1], this.pos[2]-this.target[2] ] );
//     var mx = Normalize( Cross( this.up, mz ) );
//     var my = Normalize( Cross( mz, mx ) );
//     var tx = Dot( mx, this.pos );
//     var ty = Dot( my, this.pos );
//     var tz = Dot( [-mz[0], -mz[1], -mz[2]], this.pos ); 
//     var m = IdentityMat44();
//     m[0]  = mx[0]; m[1]  = my[0]; m[2]  = mz[0]; m[3]  = 0;
//     m[4]  = mx[1]; m[5]  = my[1]; m[6]  = mz[1]; m[7]  = 0;
//     m[8]  = mx[2]; m[9]  = my[2]; m[10] = mz[2]; m[11] = 0;
//     m[12] = tx;    m[13] = ty;    m[14] = tz;    m[15] = 1; 
//     return m;
// } 

var ShaderProgram = {};
ShaderProgram.Create = function( shaderList ) {
    var shaderObjs = [];
    for ( var i_sh = 0; i_sh < shaderList.length; ++ i_sh ) {
        var shderObj = this.CompileShader( shaderList[i_sh].source, shaderList[i_sh].stage );
        if ( shderObj == 0 )
            return 0;
        shaderObjs.push( shderObj );
    }
    var progObj = this.LinkProgram( shaderObjs )
    if ( progObj != 0 ) {
        progObj.attribIndex = {};
        var noOfAttributes = gl.getProgramParameter( progObj, gl.ACTIVE_ATTRIBUTES );
        for ( var i_n = 0; i_n < noOfAttributes; ++ i_n ) {
            var name = gl.getActiveAttrib( progObj, i_n ).name;
            progObj.attribIndex[name] = gl.getAttribLocation( progObj, name );
        }
        progObj.unifomLocation = {};
        var noOfUniforms = gl.getProgramParameter( progObj, gl.ACTIVE_UNIFORMS );
        for ( var i_n = 0; i_n < noOfUniforms; ++ i_n ) {
            var name = gl.getActiveUniform( progObj, i_n ).name;
            progObj.unifomLocation[name] = gl.getUniformLocation( progObj, name );
        }
    }
    return progObj;
}
ShaderProgram.AttributeIndex = function( progObj, name ) { return progObj.attribIndex[name]; } 
ShaderProgram.UniformLocation = function( progObj, name ) { return progObj.unifomLocation[name]; } 
ShaderProgram.Use = function( progObj ) { gl.useProgram( progObj ); } 
ShaderProgram.SetUniformI1  = function( progObj, name, val ) { if(progObj.unifomLocation[name]) gl.uniform1i( progObj.unifomLocation[name], val ); }
ShaderProgram.SetUniformF1  = function( progObj, name, val ) { if(progObj.unifomLocation[name]) gl.uniform1f( progObj.unifomLocation[name], val ); }
ShaderProgram.SetUniformF2  = function( progObj, name, arr ) { if(progObj.unifomLocation[name]) gl.uniform2fv( progObj.unifomLocation[name], arr ); }
ShaderProgram.SetUniformF3  = function( progObj, name, arr ) { if(progObj.unifomLocation[name]) gl.uniform3fv( progObj.unifomLocation[name], arr ); }
ShaderProgram.SetUniformF4  = function( progObj, name, arr ) { if(progObj.unifomLocation[name]) gl.uniform4fv( progObj.unifomLocation[name], arr ); }
ShaderProgram.SetUniformM33 = function( progObj, name, mat ) { if(progObj.unifomLocation[name]) gl.uniformMatrix3fv( progObj.unifomLocation[name], false, mat ); }
ShaderProgram.SetUniformM44 = function( progObj, name, mat ) { if(progObj.unifomLocation[name]) gl.uniformMatrix4fv( progObj.unifomLocation[name], false, mat ); }
ShaderProgram.CompileShader = function( source, shaderStage ) {
    var shaderScript = document.getElementById(source);
    if (shaderScript) {
      source = "";
      var node = shaderScript.firstChild;
      while (node) {
        if (node.nodeType == 3) source += node.textContent;
        node = node.nextSibling;
      }
    }
    var shaderObj = gl.createShader( shaderStage );
    gl.shaderSource( shaderObj, source );
    gl.compileShader( shaderObj );
    var status = gl.getShaderParameter( shaderObj, gl.COMPILE_STATUS );
    if ( !status ) alert(gl.getShaderInfoLog(shaderObj));
    return status ? shaderObj : 0;
} 
ShaderProgram.LinkProgram = function( shaderObjs ) {
    var prog = gl.createProgram();
    for ( var i_sh = 0; i_sh < shaderObjs.length; ++ i_sh )
        gl.attachShader( prog, shaderObjs[i_sh] );
    gl.linkProgram( prog );
    status = gl.getProgramParameter( prog, gl.LINK_STATUS );
    if ( !status ) alert("Could not initialise shaders");
    gl.useProgram( null );
    return status ? prog : 0;
}

// var VertexBuffer = {};
// VertexBuffer.Create = function( attributes, indices ) {
//     var buffer = {};
//     buffer.buf = [];
//     buffer.attr = []
//     for ( var i = 0; i < attributes.length; ++ i ) {
//         buffer.buf.push( gl.createBuffer() );
//         buffer.attr.push( { size : attributes[i].attrSize, loc : attributes[i].attrLoc } );
//         gl.bindBuffer( gl.ARRAY_BUFFER, buffer.buf[i] );
//         gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( attributes[i].data ), gl.STATIC_DRAW );
//     }
//     buffer.inx = gl.createBuffer();
//     gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer.inx );
//     gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), gl.STATIC_DRAW );
//     buffer.inxLen = indices.length;
//     gl.bindBuffer( gl.ARRAY_BUFFER, null );
//     gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
//     return buffer;
// }
// VertexBuffer.Draw = function( bufObj ) {
//   for ( var i = 0; i < bufObj.buf.length; ++ i ) {
//         gl.bindBuffer( gl.ARRAY_BUFFER, bufObj.buf[i] );
//         gl.vertexAttribPointer( bufObj.attr[i].loc, bufObj.attr[i].size, gl.FLOAT, false, 0, 0 );
//         gl.enableVertexAttribArray( bufObj.attr[i].loc );
//     }
//     gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, bufObj.inx );
//     gl.drawElements( gl.TRIANGLES, bufObj.inxLen, gl.UNSIGNED_SHORT, 0 );
//     for ( var i = 0; i < bufObj.buf.length; ++ i )
//        gl.disableVertexAttribArray( bufObj.attr[i].loc );
//     gl.bindBuffer( gl.ARRAY_BUFFER, null );
//     gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, null );
// }

    var Texture = {};
    Texture.HandleLoadedTexture2D = function( image, texture, flipY ) {
        gl.activeTexture( gl.TEXTURE0 );
        gl.bindTexture( gl.TEXTURE_2D, texture );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );
        if ( flipY != undefined && flipY == true )
          gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
        gl.bindTexture( gl.TEXTURE_2D, null );
        return texture;
    }
    Texture.LoadTexture2D = function( name ) {
        var texture = gl.createTexture();
        texture.image = new Image(64,64);
        texture.image.setAttribute('crossorigin', 'anonymous');
        texture.image.onload = function () {
            var canvas = document.createElement( 'canvas' );
            canvas.width = 512;
            canvas.height = 256;
            var context = canvas.getContext( '2d' );
            context.drawImage( texture.image, 0, 0, canvas.width, canvas.height );
            Texture.HandleLoadedTexture2D( canvas, texture, true )
        }
        texture.image.src = name;
        return texture;
    }
   
var ticks = 0; 

    
function drawScene(){

    
    // Camera.create();
    // Camera.vp = [canvas.width, canvas.height];
    //var currentTime = Date.now();   
    //var deltaMS = currentTime - startTime;
    ticks = ticks + 1;
        
    
    //gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
    
    gl.disable( gl.DEPTH_TEST );
    
    var texUnit = 1;
    gl.activeTexture( gl.TEXTURE0 + texUnit );
    gl.bindTexture( gl.TEXTURE_2D, textureObj );
    var tex_loc = gl.getUniformLocation( progBG, "u_texture" );
    gl.useProgram( progBG );
    gl.uniform1i( tex_loc, texUnit );
    console.log("textureObj is:",textureObj);
    var v_attr_inx = gl.getAttribLocation( progBG, "inPos" );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufRect );
    gl.vertexAttribPointer( v_attr_inx, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( v_attr_inx );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    gl.disableVertexAttribArray( v_attr_inx );
    
    // set up draw shader
    // ShaderProgram.Use( progDraw );
    // ShaderProgram.SetUniformM44( progDraw, "u_projectionMat44", Camera.Perspective() );
    // ShaderProgram.SetUniformM44( progDraw, "u_viewMat44", Camera.LookAt() );
    // var modelMat = IdentityMat44()
    // modelMat = RotateAxis( modelMat, CalcAng( currentTime, 13.0 ), 0 );
    // modelMat = RotateAxis( modelMat, CalcAng( currentTime, 17.0 ), 1 );
    // ShaderProgram.SetUniformM44( progDraw, "u_modelMat44", modelMat );
    
    // draw scene
    gl.clear( gl.DEPTH_BUFFER_BIT );
    gl.enable( gl.DEPTH_TEST );
    //VertexBuffer.Draw( bufCube );
}

var startTime;
// function Fract( val ) { 
//     return val - Math.trunc( val );
// }
// function CalcAng( currentTime, intervall ) {
//     return Fract( (currentTime - startTime) / (1000*intervall) ) * 2.0 * Math.PI;
// }
// function CalcMove( currentTime, intervall, range ) {
//     var pos = self.Fract( (currentTime - startTime) / (1000*intervall) ) * 2.0
//     var pos = pos < 1.0 ? pos : (2.0-pos)
//     return range[0] + (range[1] - range[0]) * pos;
// }    
// function EllipticalPosition( a, b, angRag ) {
//     var a_b = a * a - b * b
//     var ea = (a_b <= 0) ? 0 : Math.sqrt( a_b );
//     var eb = (a_b >= 0) ? 0 : Math.sqrt( -a_b );
//     return [ a * Math.sin( angRag ) - ea, b * Math.cos( angRag ) - eb, 0 ];
// }

var sliderScale = 100.0

var progDraw, progBG;
//var bufCube = {};
var bufRect = {};
function sceneStart() {

    canvas = document.getElementById( "draw-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //var vp = [canvas.width, canvas.height];
    gl = canvas.getContext( "experimental-webgl" );
    if ( !gl )
      return;
    gl.viewport( 0, 0, canvas.width, canvas.height );
    progBG = ShaderProgram.Create( 
      [ { source : "background-shader-vs", stage : gl.VERTEX_SHADER },
        { source : "background-shader-fs", stage : gl.FRAGMENT_SHADER }
      ] );
      progBG.inPos = gl.getAttribLocation( progBG, "inPos" );
    if ( progBG == 0 )
        return; 

    // progDraw = ShaderProgram.Create( 
    //   [ { source : "draw-shader-vs", stage : gl.VERTEX_SHADER },
    //     { source : "draw-shader-fs", stage : gl.FRAGMENT_SHADER }
    //   ] );
    // progDraw.inPos = gl.getAttribLocation( progDraw, "inPos" );
    // progDraw.inCol = gl.getAttribLocation( progDraw, "inCol" );
    // if ( progDraw == 0 )
    //     return;   

    //textureObj = Texture.LoadTexture2D( "https://raw.githubusercontent.com/Rabbid76/graphics-snippets/master/resource/texture/supermario.jpg" );    
    textureObj = Texture.LoadTexture2D( "https://raw.githubusercontent.com/Rabbid76/graphics-snippets/master/resource/texture/background.jpg" ); 

    bufRect = gl.createBuffer()
    gl.bindBuffer( gl.ARRAY_BUFFER, bufRect );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [ -1, -1, 1, -1, 1, 1, -1, 1 ] ), gl.STATIC_DRAW );

    // create cube
    // var cubePos = [
    //   -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
    //   -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,  1.0, -1.0, -1.0,  1.0, -1.0 ];
    // var cubeCol = [ 1.0, 0.0, 0.0, 1.0, 0.5, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ];
    // var cubeHlpInx = [ 0, 1, 2, 3, 1, 5, 6, 2, 5, 4, 7, 6, 4, 0, 3, 7, 3, 2, 6, 7, 1, 0, 4, 5 ];  
    // var cubePosData = [];
    // for ( var i = 0; i < cubeHlpInx.length; ++ i ) {
    //   cubePosData.push( cubePos[cubeHlpInx[i]*3], cubePos[cubeHlpInx[i]*3+1], cubePos[cubeHlpInx[i]*3+2] );
    // }
    // var cubeNVData = [];
    // for ( var i1 = 0; i1 < cubeHlpInx.length; i1 += 4 ) {
    // var nv = [0, 0, 0];
    // for ( i2 = 0; i2 < 4; ++ i2 ) {
    //     var i = i1 + i2;
    //     nv[0] += cubePosData[i*3]; nv[1] += cubePosData[i*3+1]; nv[2] += cubePosData[i*3+2];
    // }
    // for ( i2 = 0; i2 < 4; ++ i2 )
    //   cubeNVData.push( nv[0], nv[1], nv[2] );
    // }
    // var cubeColData = [];
    // for ( var is = 0; is < 6; ++ is ) {
    //   for ( var ip = 0; ip < 4; ++ ip ) {
    //    cubeColData.push( cubeCol[is*3], cubeCol[is*3+1], cubeCol[is*3+2] ); 
    //   }
    // }
    // var cubeInxData = [];
    // for ( var i = 0; i < cubeHlpInx.length; i += 4 ) {
    //   cubeInxData.push( i, i+1, i+2, i, i+2, i+3 );   
    // }
    // bufCube = VertexBuffer.Create(
    // [ { data : cubePosData, attrSize : 3, attrLoc : progDraw.inPos },
    //   //{ data : cubeNVData,  attrSize : 3, attrLoc : progDraw.inNV },
    //   { data : cubeColData, attrSize : 3, attrLoc : progDraw.inCol } ],
    //   cubeInxData );

    startTime = Date.now();
    setInterval(drawScene, 50);
}