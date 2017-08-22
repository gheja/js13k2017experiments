"use strict";

const PALETTE_LENGTH = 1000;

let canvas = null;
let ctx = null;
let body = null;
let gui = null;
let prng = null;
let _seed = 0;

const WIDTH = 1920;
const HEIGHT = 1080;
// const WIDTH = 480;
// const HEIGHT = 270;
const SCALE = HEIGHT / 400;

let palette = [];

let settings = {
	a: 0,
	b: 0.0025,
	c: 30,
	z: 1,
	
	autoUpdate: true
};


//// functions

function _scale(x)
{
	return x * SCALE;
}

function clamp(x, min, max)
{
	if (x < min)
	{
		return min;
	}
	
	if (x > max)
	{
		return max;
	}
	
	return x;
}

function lerp(a, b, x)
{
	return a + (b - a) * Math.pow(x, settings.pow);
}


//// 3drotate

// const PI2 = 2 * Math.PI;
const PI2 = 6.283;

function sin(x)
{
	return Math.sin(x * PI2);
}

function cos(x)
{
	return Math.cos(x * PI2);
}

function pos(x, y)
{
	let s = sin(settings.a);
	let c = cos(settings.a);
	let p;
	
	return [
		_scale((x * c) * settings.z),
		_scale((y + s * x * y * settings.b) * settings.z)
	];
}


//// main

function draw()
{
	let i, j, p;
	
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = "rgba(0,0,0,0.03)";
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.fillStyle = "#fff";
	
	ctx.lineWidth = _scale(1.5);
	ctx.strokeStyle = "#fff";
	ctx.beginPath();
	for (i=0; i<settings.c; i++)
	{
		p = pos(cos(i/settings.c) * 50, sin(i/settings.c) * 50);
		
		p[0] += WIDTH / 2;
		p[1] += HEIGHT / 2;
		
		if (i == 0)
		{
			ctx.moveTo(p[0], p[1]);
		}
		else
		{
			ctx.lineTo(p[0], p[1]);
		}
	}
	ctx.stroke();
	
	for (i=0; i<settings.c; i++)
	{
		ctx.beginPath();
		
		p = pos(-50, (i/settings.c) * 200 - 100);
		p[0] += WIDTH / 2;
		p[1] += HEIGHT / 2;
		ctx.moveTo(p[0], p[1]);
		
		p = pos(50, (i/settings.c) * 200 - 100);
		p[0] += WIDTH / 2;
		p[1] += HEIGHT / 2;
		ctx.lineTo(p[0], p[1]);
		
		ctx.stroke();
	}
	
	settings.a += 0.005;
	if (settings.a > 1)
	{
		settings.a -= 1;
	}
	
	_raf(draw);
}

function init()
{
	let tmp;
	
	prng = new AlmostRandom();
	
	canvas = document.createElement("canvas");
	
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	ctx = canvas.getContext("2d");
	
	body = document.body;
	body.appendChild(canvas);
	
	gui = new dat.gui.GUI();
	
	tmp = gui.addFolder("Wormhole");
	
	tmp.add(settings, 'a').min(0).max(1).step(0.01);
	tmp.add(settings, 'b').min(0).max(0.02).step(0.0001);
	tmp.add(settings, 'c').min(3).max(30).step(1);
	tmp.add(settings, 'z').min(0).max(1).step(0.01);
	
	tmp.add(settings, 'autoUpdate');
	
	tmp.open();
	
	draw();
}

var _raf = window.requestAnimationFrame;

window.onload = init;
