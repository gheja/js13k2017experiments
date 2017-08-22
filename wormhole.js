"use strict";

const PALETTE_LENGTH = 1000;

let canvas = null;
let ctx = null;
let body = null;
let gui = null;

let viewZ = 0;
let viewZStep = 0.5;
let lastFrameTime = 0;

const WIDTH = 1920;
const HEIGHT = 1080;
// const WIDTH = 480;
// const HEIGHT = 270;
const SCALE = HEIGHT / 400;

let palette = [];

let settings = {
	a: 0,
	b: 0,
	distortion: 0.0025,
	n: 30,
	z: 1,
	
	autoB: false,
	autoUpdate: true
};

let settings2 = {
	steps: 100,
	stars: 100,
	diffA: 0.001,
	diffB: 0.001
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

function _hackClone(x)
{
	return JSON.parse(JSON.stringify(x));
}

function rand(x)
{
	return (Math.random() - 0.5) * x;
}

function rande(x, y)
{
	let r;
	
	r = 0;
	
	while (Math.abs(r) < y)
	{
		r = Math.random() - 0.5;
	}
	
	return r * x;
}


//// 3drotate

let csteps = [];
let cstars = [];
let va = 0;
let vb = 0;
let vx = 0;
let vy = 0;

function generateStars()
{
	let i;
	
	cstars = [];
	
	for (i=0; i<settings2.stars; i++)
	{
		// cstars.push({ x: rande(1000, 0.01), y: rande(1000, 0.01), z: - Math.random() * 100, length: 300 });
		cstars.push({ x: rand(200), y: rand(200), z: - Math.random() * 100, length: Math.random() * 10 });
	}
}

function pushStep(shift)
{
	if (shift)
	{
		viewZ += viewZStep;
		csteps.shift();
	}
	
	va = clamp(va + rand(0.01), -0.03, 0.03);
	vb = clamp(vb + rand(0.01), -0.01, 0.01);
	vx = clamp(vx + rand(1), -3, 3);
	vy = clamp(vy + rand(1), -3, 3);
	
	csteps.push({ a: va, b: vb, x: vx, y: vy });
}

function generateSteps()
{
	let i;
	
	csteps = [];
	
	for (i=0; i<settings2.steps; i++)
	{
		pushStep(false);
	}
}

function animationStep()
{
}

const PI2 = 2 * Math.PI;
// const PI2 = 6.283;

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
	let s = sin(settings.b);
	let c = cos(settings.b);
	let s2 = sin(settings.a);
	let c2 = cos(settings.a);
	let p, x2, y2, w;
	
	w = Math.pow(10, settings.z / 10);
	
	x2 = c2 * x + s2 * y;
	y2 = s2 * x - c2 * y;
	
	return [
		_scale((x2 * c) * w),
		_scale((y2 + s * x2 * y2 * settings.distortion) * w)
	];
}

function pos2(x, y, z, a, b)
{
	let s = sin(b);
	let c = cos(b);
	let s2 = sin(a);
	let c2 = cos(a);
	let p, x2, y2, w;
	
	w = Math.pow(10, z / 10);
	
	x2 = c2 * x + s2 * y;
	y2 = s2 * x - c2 * y;
	
	return [
		_scale((x2 * c) * w),
		_scale((y2 + s * x2 * y2 * settings.distortion) * w)
	];
}

function rpos(p)
{
	return [ _scale(p[0]) + WIDTH / 2, _scale(p[1]) + HEIGHT / 2 ];
}


//// main

function draw()
{
	let i, j, k, p, star, a, b, x, y, z, c, lastC, now, dt, lineStarted;
	
//	_raf(draw);
	
	now = (new Date()).getTime();
	dt = now - lastFrameTime;
	console.log(dt);
	
	if (dt < 33)
	{
//		return;
	}
	
	lastFrameTime = now;
	
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = _scale(1);
	
	
	for (i=0; i<cstars.length; i++)
	{
		star = cstars[i];
		
		k = 0;
		a = 0;
		b = 0;
		x = 0;
		y = 0;
		z = 0;
		lastC = -1;
		for (j=0; j<settings2.steps; j++)
		{
			a += csteps[j].a;
			b += csteps[j].b;
			x += csteps[j].x;
			y += csteps[j].y;
			z -= viewZStep;
			
			if (z - viewZ >= star.z - star.length && z - viewZ < star.z)
			{
				p = rpos(pos2(star.x + x, star.y + y, z, a, b));
				
				c = Math.floor(_scale(Math.pow(10, z / 500) * 5));
				
				console.log("c = " + c);
				
				if (!lineStarted)
				{
					ctx.beginPath();
				}
				
				if (k == 0)
				{
					ctx.moveTo(p[0], p[1]);
				}
				else
				{
					ctx.lineTo(p[0], p[1]);
				}
				
				lastC = c;
			}
			else
			{
				if (k > 0)
				{
					ctx.stroke();
					k = 0;
					
					break;
				}
			}
		}
		
		if (star.z + viewZ > 1)
		{
			star.z -= Math.random() * 30;
		}
	}
	
	pushStep(true);
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
	
/*
	gui = new dat.gui.GUI();
	
	tmp = gui.addFolder("3D rotate");
	
	tmp.add(settings, 'a').min(0).max(1).step(0.01);
	tmp.add(settings, 'b').min(0).max(1).step(0.01).listen();
	tmp.add(settings, 'distortion').min(0).max(0.02).step(0.0001);
	tmp.add(settings, 'n').min(3).max(30).step(1);
	tmp.add(settings, 'z').min(0).max(1).step(0.01);
	
	tmp.add(settings, 'autoB');
	tmp.add(settings, 'autoUpdate');
	
	tmp = gui.addFolder("Animation");
	
	tmp.add(settings2, "steps").min(1).max(100);
	tmp.add(window, "generateSteps");
	tmp.add(window, "animationStep");
	
	tmp.open();
*/
	
	generateSteps();
	generateStars();
	
	lastFrameTime = (new Date()).getTime();
	
	draw();
}

var _raf = window.requestAnimationFrame;

window.onload = init;
