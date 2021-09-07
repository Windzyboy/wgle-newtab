tdl.require('tdl.fast');
tdl.require('tdl.math');
tdl.require('tdl.primitives');
tdl.require('tdl.shader');
tdl.require('tdl.programs');
tdl.require('tdl.log');
tdl.require('tdl.models');
tdl.require('tdl.buffers');
tdl.require('tdl.framebuffers');
tdl.require('tdl.textures');
tdl.require('tdl.webgl');

var gl;
var canvas;
var aspect;

// Use this to refer to the backbuffer as if it were another framebuffer
var backbuffer;
var post;
var quad;
var g_postProc;
var g_requestId;

if (!window.Float32Array) {
  // This just makes some errors go away when there is no WebGL.
  window.Float32Array = function() { };
}

var up = new Float32Array([0, 1, 0])
var output = alert
var curBeat = 0

function mainloop() {
  // Repeatedly run render(), attempt to hold 60 but the demo is
  // framerate independent so we will still keep sync even if we
  // lose frames.
  var bootTime = (new Date()).getTime();
  var singleEffect = new FlowerEffect();
  function render() {
    var now = ((new Date()).getTime() - bootTime) * 0.001;
    var music_time = now;
    aspect = canvas.clientWidth / canvas.clientHeight
    var framebuffer = backbuffer;
    singleEffect.render(framebuffer, music_time, g_postProc)
    g_requestId = requestAnimationFrame(render);
  }
  render();
}

var g_setSettingElements = [];

/*function setSetting(elem, id) {
  switch (id) {
  case 0:
  case 1:
  case 2:
  case 3:
    g_postProc = id
    for (var ii = 0; ii < 4; ++ii) {
      g_setSettingElements[ii].style.color = "gray"
    }
    elem.style.color = "red"
    break;
  }
}*/

/**
 * Sets up the count buttons.
 */
function setupButtons() {
  g_postProc = 2;
  // 0 = None, not good on performance
  // 1 = Glow
  // 2 = Blur
  // 3 = RADIAL BLUR (epilepsy)
  /*g_setSettingsElements = [];
  for (var ii = 0; ii < 100; ++ii) {
    var elem = document.getElementById("setSetting" + ii);
    if (!elem) {
      break;
    }
    g_setSettingElements.push(elem);
    elem.onclick = function(elem, id) {
      return function () {
        setSetting(elem, id);
      }}(elem, ii);
  }
  setSetting(document.getElementById("setSetting1"), 1);*/
}

function initializeGraphics() {
  aspect = canvas.clientWidth / canvas.clientHeight
  quad = new QuadDrawer()
  backbuffer = tdl.framebuffers.getBackBuffer(canvas)
  post = new PostProcessor(canvas.width, canvas.height)

  // Set some sane defaults.
  gl.disable(gl.BLEND);
  gl.depthFunc(gl.LEQUAL);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  return true;
}

function setup() {
  if (initializeGraphics()) {
    setupButtons()
    mainloop()
  }
}

window.onload = function() {
  canvas = document.getElementById('render_area');

  //canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas);
  // tell the simulator when to lose context.
  //canvas.loseContextInNCalls(10000);

  tdl.webgl.registerContextLostHandler(canvas, handleContextLost);
  tdl.webgl.registerContextRestoredHandler(canvas, handleContextRestored);

  canvas = document.getElementById('render_area');
  gl = tdl.webgl.setupWebGL(canvas);
  if (!gl) {
    return false;
  }

  setup();
}

function handleContextLost() {
  tdl.log("context lost");
  cancelAnimationFrame(g_requestId);
}

function handleContextRestored() {
  tdl.log("context restored");
  setup();
}