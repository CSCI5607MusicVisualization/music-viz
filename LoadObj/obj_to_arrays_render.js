/**
 * learn_webgl_render_01.js, By Wayne Brown, Fall 2015
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
/**
 * Build and render a scene
 * @param learn LearnWebGL Various functionality for the Learn_webgl environment
 * @param vshaders_dictionary Object A set of vertex shaders
 * @param fshaders_dictionary Object A set of fragment shaders
 * @param models Object A set of models
 * @param controls Array A list of control ID's
 * @constructor
 */
var Scene_obj_to_arrays_render = function (learn, vshaders_dictionary,
    fshaders_dictionary, models, controls) {

  var self = this; // Store a local reference to the new object.

  // Private variables
  var canvas_id = learn.canvas_id;
  var out = learn.out;

  var gl = null;
  var one_color_program;
  var color_program;
  var smooth_shading_program;

  var matrix = new Learn_webgl_matrix();
  var transform = matrix.create();
  var normal_matrix = matrix.create();
  var rotate_x_matrix = matrix.create();
  var rotate_y_matrix = matrix.create();
  var translate = matrix.create();
  var projection = matrix.createOrthographic(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);

  //-----------------------------------------------------------------------
  // Public function to render the scene.
  self.render = function () {

    // Clear the entire canvas window background with the clear color
    // out.display_info("Clearing the screen");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Build individual transforms
    matrix.setIdentity(transform);
    matrix.rotate(rotate_x_matrix, self.angle_x, 1, 0, 0);
    matrix.rotate(rotate_y_matrix, self.angle_y, 0, 1, 0);
    matrix.translate(translate, 0, -0.07, 0);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(transform, projection, rotate_x_matrix, rotate_y_matrix, translate);

    // Build the inverse transpose of the transformation matrix for
    // manipulating the normal vectors.
    // Combine the transforms into a single transformation
    matrix.inverse(normal_matrix, transform);
    matrix.transpose(normal_matrix);

    // Draw each model
    self.active_model.render(gl, transform, normal_matrix, self.render_mode);
  };

  //-----------------------------------------------------------------------
  // Public function to delete and reclaim all rendering objects.
  self.delete = function () {

    // Clean up shader programs
    gl.deleteShader(one_color_program.vShader);
    gl.deleteShader(one_color_program.fShader);
    gl.deleteProgram(one_color_program);
    one_color_program = null;

    gl.deleteShader(color_program.vShader);
    gl.deleteShader(color_program.fShader);
    gl.deleteProgram(color_program);
    color_program = null;

    gl.deleteShader(smooth_shading_program.vShader);
    gl.deleteShader(smooth_shading_program.fShader);
    gl.deleteProgram(smooth_shading_program);
    smooth_shading_program = null;

    // Delete each model's VOB
    model_to_render.cube.delete(gl);
    model_to_render.Sphere.delete(gl);
    model_to_render.Dragon.delete(gl);
    model_to_render = null;

    // Remove all event handlers
    var id = '#' + canvas_id;
    $(id).unbind("mousedown", events.mouse_drag_started);
    $(id).unbind("mouseup", events.mouse_drag_ended);
    $(id).unbind("mousemove", events.mouse_dragged);
    events.removeAllEventHandlers();
    events = null;

    // Disable any animation
    self.animate_active = false;

    gl = null;
  };

  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Public variables that will be changed by event handlers.
  self.canvas = null;
  self.angle_x = 0.0;
  self.angle_y = 0.0;
  self.animate_active = false;
  self.model_to_render = {};
  self.model_name = "Cube";
  self.active_model;

  // Get the rendering context for the canvas
  self.canvas = learn.getCanvas(canvas_id);
  if (self.canvas) {
    gl = learn.getWebglContext(self.canvas);
  }
  if (!gl) {
    return;
  }

  // Create Vertex Object Buffers for the models
  self.model_to_render.Cube = new Learn_webgl_vob_model_05(gl, models.Cube, out);
  self.model_to_render.Sphere = new Learn_webgl_vob_model_05(gl, models.Sphere, out);
  self.model_to_render.Dragon = new Learn_webgl_vob_model_05(gl, models.Dragon, out);

  self.active_model = self.model_to_render.Cube;

  // Set up the rendering shader programs
  one_color_program = learn.createProgram(gl, vshaders_dictionary.shader01, fshaders_dictionary.shader01);
  color_program = learn.createProgram(gl, vshaders_dictionary.shader05, fshaders_dictionary.shader05);
  smooth_shading_program = learn.createProgram(gl, vshaders_dictionary.shader06, fshaders_dictionary.shader06);

  self.model_to_render.Cube.setShaderProgram(gl, color_program, self.active_model.JUST_COLOR);
  self.model_to_render.Cube.setShaderProgram(gl, smooth_shading_program, self.active_model.FLAT_SHADING);
  self.model_to_render.Cube.setShaderProgram(gl, smooth_shading_program, self.active_model.SMOOTH_SHADING);
  self.model_to_render.Cube.setShaderProgram(gl, one_color_program, self.active_model.WIREFRAME);

  self.model_to_render.Sphere.setShaderProgram(gl, color_program, self.active_model.JUST_COLOR);
  self.model_to_render.Sphere.setShaderProgram(gl, smooth_shading_program, self.active_model.FLAT_SHADING);
  self.model_to_render.Sphere.setShaderProgram(gl, smooth_shading_program, self.active_model.SMOOTH_SHADING);
  self.model_to_render.Sphere.setShaderProgram(gl, one_color_program, self.active_model.WIREFRAME);

  self.model_to_render.Dragon.setShaderProgram(gl, color_program, self.active_model.JUST_COLOR);
  self.model_to_render.Dragon.setShaderProgram(gl, smooth_shading_program, self.active_model.FLAT_SHADING);
  self.model_to_render.Dragon.setShaderProgram(gl, smooth_shading_program, self.active_model.SMOOTH_SHADING);
  self.model_to_render.Dragon.setShaderProgram(gl, one_color_program, self.active_model.WIREFRAME);

  // Enable hidden-surface removal
  gl.enable(gl.DEPTH_TEST);

  self.render_mode = self.active_model.JUST_COLOR;

  // Set up callbacks for user and timer events
  var events;
  events = new Event_obj_to_arrays_01(self, controls);

  var id = '#' + canvas_id;
  $(id).mousedown(events.mouse_drag_started);
  $(id).mouseup(events.mouse_drag_ended);
  $(id).mousemove(events.mouse_dragged);
};

