"use strict";

let canvas = null;
let ctx = null;
let body = null;
let gui = null;

let settings = {
};

function draw()
{
}

function init()
{
	let tmp;
	
	canvas = document.createElement("canvas");
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	ctx = canvas.getContext("2d");
	
	body = document.body;
	body.appendChild(canvas);
	
	lastFrameTime = (new Date()).getTime();
	
	draw();
	
	body.onclick = regenerate;
	regenerate();
}

var _raf = window.requestAnimationFrame;

window.onload = init;
