/**
 * learn_webgl_vob_model_05.js, By Wayne Brown, Fall 2015
 *
 * Given
 *   - a model definition as defined in learn_webgl_model_01.js, and
 *   - specific shader programs: vShader01.vert, fShader01.frag
 * Perform the following tasks:
 *   1) Build appropriate Vertex Object Buffers (VOB's)
 *   2) Create GPU VOB's for the data and copy the data into the buffers.
 *   3) Render the VOB's
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 C. Wayne Brown
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

//-------------------------------------------------------------------------
// Build, create, copy and render 3D objects specific to a particular
// model definition and particular WebGL shaders.
//-------------------------------------------------------------------------
var Learn_webgl_vob_model_05 = function (gl, model, out) {

  var self = this;

  // Public constants - modes of rendering
  self.JUST_COLOR = 0;
  self.FLAT_SHADING = 1;
  self.SMOOTH_SHADING = 2;
  self.WIREFRAME = 3;

  // An array of shader programs, one for each drawing mode
  var shader_programs = new Array(4);

  // Color for edges for wireframe
  var black_for_edges = new Float32Array([0,0,0,1]);

  // Variables to remember so the model can be rendered.
  var number_triangles = 0;
  var triangles_vertex_buffer_id = null;
  var triangles_color_buffer_id = null;
  var triangles_normal_buffer_id = null;
  var triangles_smooth_normal_buffer_id = null;
  var triangles_render_normal_buffer_id = null;
  var triangles_render_smooth_normal_buffer_id = null;

  var number_lines = 0;
  var lines_vertex_buffer_id = null;
  var lines_color_buffer_id = null;

  var number_points = 0;
  var points_vertex_buffer_id = null;
  var points_color_buffer_id = null;

  //-----------------------------------------------------------------------
  function _createBufferObject(gl, data) {
    // Create a buffer object
    var buffer_id;

    buffer_id = gl.createBuffer();
    if (!buffer_id) {
      out.displayError('Failed to create the buffer object for ' + model.name);
      return null;
    }

    // Make the buffer object the active buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_id);

    // Upload the data for this buffer object to the GPU.
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    return buffer_id;
  }

  //-----------------------------------------------------------------------
  function _buildVobBuffers() {

    // Build the buffers for the triangles
    if (model.triangles !== null && model.triangles.vertices.length > 0) {
      number_triangles = model.triangles.vertices.length / 3 / 3;
      triangles_vertex_buffer_id = _createBufferObject(gl, model.triangles.vertices);
      triangles_color_buffer_id = _createBufferObject(gl, model.triangles.colors);
      triangles_normal_buffer_id = _createBufferObject(gl, model.triangles.flat_normals);
      triangles_smooth_normal_buffer_id = _createBufferObject(gl, model.triangles.smooth_normals);

      if (model.triangles.hasOwnProperty("render_flat_normals")) {
        triangles_render_normal_buffer_id = _createBufferObject(gl, model.triangles.render_flat_normals);
      }
      if (model.triangles.hasOwnProperty("render_smooth_normals")) {
        triangles_render_smooth_normal_buffer_id = _createBufferObject(gl, model.triangles.render_smooth_normals);
      }
    }

    // Build the buffers for the lines
    if (model.lines !== null && model.lines.vertices.length > 0) {
      number_lines = model.lines.vertices.length / 3 / 2;
      lines_vertex_buffer_id = _createBufferObject(gl, model.lines.vertices);
      lines_color_buffer_id = _createBufferObject(gl, model.lines.colors);
    }

    // Build the buffers for the points
    if (model.points !== null && model.points.vertices.length > 0) {
      number_points = model.points.vertices.length / 3; // 3 components per vertex
      points_vertex_buffer_id = _createBufferObject(gl, model.points.vertices);
      points_color_buffer_id = _createBufferObject(gl, model.points.colors);
    }

  }

  //-----------------------------------------------------------------------
  // These one-time tasks set up the rendering of the models.
  _buildVobBuffers();

  //-----------------------------------------------------------------------
  self.setShaderProgram = function (gl, program, mode) {
    if (mode === self.JUST_COLOR) {

      shader_programs[self.JUST_COLOR] = program;
      // Get the location of the shader variables
      program.u_Transform = gl.getUniformLocation(program, "u_Transform");

      program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');
      program.a_Color = gl.getAttribLocation(program, 'a_Color');

    } else if (mode === self.FLAT_SHADING || mode === self.SMOOTH_SHADING) {

      shader_programs[self.FLAT_SHADING] = program;
      shader_programs[self.SMOOTH_SHADING] = program;

      // Get the location of the shader variables
      program.u_Transform = gl.getUniformLocation(program, "u_Transform");
      program.u_Normal_matrix = gl.getUniformLocation(program, "u_Normal_matrix");

      program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');
      program.a_Color = gl.getAttribLocation(program, 'a_Color');
      program.a_Face_normal = gl.getAttribLocation(program, 'a_Face_normal');

    } else if (mode === self.WIREFRAME) {

      shader_programs[self.WIREFRAME] = program;
      // Get the location of the shader variables
      program.u_Transform = gl.getUniformLocation(program, "u_Transform");
      program.u_Color = gl.getUniformLocation(program, 'u_Color');

      program.a_Vertex = gl.getAttribLocation(program, 'a_Vertex');

    }

  };

  //-----------------------------------------------------------------------
  self.delete = function (gl) {
    if (number_triangles > 0) {
      gl.deleteBuffer(triangles_vertex_buffer_id);
      gl.deleteBuffer(triangles_color_buffer_id);
    }
    if (number_lines > 0) {
      gl.deleteBuffer(lines_vertex_buffer_id);
      gl.deleteBuffer(lines_color_buffer_id);
    }
    if (number_points > 0) {
      gl.deleteBuffer(points_vertex_buffer_id);
      gl.deleteBuffer(points_color_buffer_id);
    }
  };

  //-----------------------------------------------------------------------
  function _renderPoints(program) {
    if (number_points > 0) {
      // Activate the model's vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, points_vertex_buffer_id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's point color object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, points_color_buffer_id);

      // Bind the colors VOB to the 'a_Color' shader variable
      gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Color);

      // Draw all of the lines
      gl.drawArrays(gl.POINTS, 0, number_points);
    }
  }

  //-----------------------------------------------------------------------
  function _renderLines(program) {
    if (number_lines > 0) {
      // Activate the model's line vertex object buffer (VOB)
      gl.bindBuffer(gl.ARRAY_BUFFER, lines_vertex_buffer_id);

      // Bind the vertices VOB to the 'a_Vertex' shader variable
      //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
      gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Vertex);

      // Activate the model's line color object buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, lines_color_buffer_id);

      // Bind the colors VOB to the 'a_Color' shader variable
      gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.a_Color);

      // Draw all of the lines
      gl.drawArrays(gl.LINES, 0, number_lines * 2);
    }
  }

  //-----------------------------------------------------------------------
  function _renderTrianglesJustColors(program) {
    // Activate the model's triangle vertex object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

    // Bind the vertices VOB to the 'a_Vertex' shader variable
    //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
    gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Vertex);

    // Activate the model's triangle color object buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_color_buffer_id);

    // Bind the colors VOB to the 'a_Color' shader variable
    gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Color);

    // Draw all of the triangles
    gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);
  }

  //-----------------------------------------------------------------------
  function _renderTrianglesFlatShading(program, normal_matrix) {

    // Set the transform for all the faces, lines, and points
    gl.uniformMatrix4fv(program.u_Normal_matrix, false, normal_matrix);

    // Activate the model's triangle vertex object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

    // Bind the vertices VOB to the 'a_Vertex' shader variable
    //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
    gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Vertex);

    // Activate the model's triangle color object buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_color_buffer_id);

    // Bind the colors VOB to the 'a_Color' shader variable
    gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Color);

    // Activate the model's triangle color object buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_normal_buffer_id);

    // Bind the colors VOB to the 'a_Face_normal' shader variable
    gl.vertexAttribPointer(program.a_Face_normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Face_normal);

    // Draw all of the triangles
    gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);
  }

  //-----------------------------------------------------------------------
  function _renderTrianglesSmoothShading(program, normal_matrix) {

    // Set the transform for all the faces, lines, and points
    gl.uniformMatrix4fv(program.u_Normal_matrix, false, normal_matrix);

    // Activate the model's triangle vertex object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

    // Bind the vertices VOB to the 'a_Vertex' shader variable
    //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
    gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Vertex);

    // Activate the model's triangle color object buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_color_buffer_id);

    // Bind the colors VOB to the 'a_Color' shader variable
    gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Color);

    // Activate the model's triangle color object buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_smooth_normal_buffer_id);

    // Bind the colors VOB to the 'a_Face_normal' shader variable
    gl.vertexAttribPointer(program.a_Face_normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Face_normal);

    // Draw all of the triangles
    gl.drawArrays(gl.TRIANGLES, 0, number_triangles * 3);
  }

  //-----------------------------------------------------------------------
  function _renderTrianglesWireframe(program) {
    var j, start;

    // Set the uniform color
    gl.uniform4fv(program.u_Color, black_for_edges);

    // Activate the model's triangle vertex object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, triangles_vertex_buffer_id);

    // Bind the vertices VOB to the 'a_Vertex' shader variable
    //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
    gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Vertex);

    // Draw a line_loop around each of the triangles
    for (j = 0, start = 0; j < number_triangles; j += 1, start += 3) {
      gl.drawArrays(gl.LINE_LOOP, start, 3);
    }
  }

  //-----------------------------------------------------------------------
  function _renderNormals(program, buffer, n_lines) {

    // Set the uniform color
    gl.uniform4fv(program.u_Color, black_for_edges);

    // Activate the model's line vertex object buffer (VOB)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Bind the vertices VOB to the 'a_Vertex' shader variable
    //var stride = self.vertices3[0].BYTES_PER_ELEMENT*3;
    gl.vertexAttribPointer(program.a_Vertex, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Vertex);

    // Draw all of the lines
    gl.drawArrays(gl.LINES, 0, n_lines * 2);

  }

  //-----------------------------------------------------------------------
  self.render = function (gl, transform, normal_matrix, mode) {
    var program, n_lines;


    if (number_points > 0 || number_lines > 0) {
      program = shader_programs[self.JUST_COLOR];
      gl.useProgram(program);

      // Set the transform for all the faces, lines, and points
      gl.uniformMatrix4fv(program.u_Transform, false, transform);

      // Points and lines are not effected by normal vectors and lighting.
      _renderPoints(program);
      _renderLines(program);
    }

    if (number_triangles > 0) {
      program = shader_programs[mode];
      gl.useProgram(program);

      // Set the transform for all the faces, lines, and points
      gl.uniformMatrix4fv(program.u_Transform, false, transform);

      if (mode === self.JUST_COLOR) {

        _renderTrianglesJustColors(program);

      } else if (mode === self.FLAT_SHADING) {

        _renderTrianglesFlatShading(program, normal_matrix);
        if (triangles_render_normal_buffer_id !== null) {
          program = shader_programs[self.WIREFRAME];
          gl.useProgram(program);
          // Set the transform for all the faces, lines, and points
          gl.uniformMatrix4fv(program.u_Transform, false, transform);
          n_lines = model.triangles.render_flat_normals.length / 3 / 2;
          _renderNormals(program, triangles_render_normal_buffer_id, n_lines);
        }

      } else if (mode === self.SMOOTH_SHADING) {

        _renderTrianglesSmoothShading(program, normal_matrix);
        if (triangles_render_smooth_normal_buffer_id !== null) {
          program = shader_programs[self.WIREFRAME];
          gl.useProgram(program);
          // Set the transform for all the faces, lines, and points
          gl.uniformMatrix4fv(program.u_Transform, false, transform);
          n_lines = (model.triangles.render_smooth_normals.length / 3 / 2);
          _renderNormals(program, triangles_render_smooth_normal_buffer_id, n_lines);
        }

      } else if (mode === self.WIREFRAME) {

        _renderTrianglesWireframe(program);

      }
    }
  };

};
