"use strict";

let hasBeginning = true;
let hasEnd = true;
let starsTotal = 300;

let starsToRestart = 0;
let finished = false;

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
	steps: 40,
	stars: 250,
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

//// landscape
function convert(p, q, t)
{
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1/6) return p + (q - p) * 6 * t;
	if (t < 3/6) return q;
	if (t < 4/6) return p + (q - p) * 6 * (4/6 - t);
	return p
}

function hsla2rgba(h, s, l, a)
{
	// thanks Mohsen! https://stackoverflow.com/a/9493060/460571
	let p, q, r, g, b;
	
	if (l < 0.5)
	{
		q = l * (1 + s);
	}
	else
	{
		q = l + s - l * s;
	}
	
	p = 2 * l - q;
	
	r = Math.floor(convert(p, q, h + 1/3) * 256);
	g = Math.floor(convert(p, q, h) * 256);
	b = Math.floor(convert(p, q, h - 1/3) * 256);
	
	return [ r, g, b, a ];
}

function hsla2rgba_(h, s, l, a)
{
	let c;
	
	c = hsla2rgba(h, s, l, a);
	
	return "rgba(" + c[0] + "," + c[1] + "," + c[2] + ", " + c[3] + ")";
}



//// 3drotate

let csteps = [];
let cstars = [];
let va = 0;
let vb = 0;
let vx = -5;
let vy = -5;

function getStarColor()
{
	// let x = [ "acf", "cde", "eef", "ffd", "ffa", "fe6", "fa3" ];
	// return "#" + x[Math.floor(Math.random() * x.length) ];
	
	// return hsla2rgba_(0.55 + rand(0.15), 1, 0.75 + rand(0.25), 0.5 + rand(0.5));
	
	return hsla2rgba_(0.53 + rand(0.12), 1, 0.6 + rand(0.5), 1);
}

function generateStars()
{
	let i, x, y;
	
	cstars = [];
	
	for (i=0; i<settings2.stars; i++)
	{
		x = 0;
		y = 0;
		
		while (Math.sqrt(x * x + y * y) < 300)
		{
			x = rand(1200);
			y = rand(1200);
		}
		
		cstars.push({ x: x, y: y, z: - Math.random() * 20, length: Math.random() * 10, size: Math.random() * 12 + 2, color: getStarColor() });
	}
}

function pushStep(shift)
{
	if (shift)
	{
		viewZ += viewZStep;
		csteps.shift();
	}
	
	va = clamp(va + rand(0.001), -0.03, 0.03);
	vb = clamp(vb + rand(0.001), -0.025, 0.025);
	vx = clamp(vx + rand(2), -20, 20);
	vy = clamp(vy + rand(2), -20, 20);
	
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
		(x2 * c) * w,
		(y2 + s * x2 * y2 * settings.distortion) * w
	];
}

function rpos(p)
{
	return [ _scale(p[0]) + WIDTH / 2, _scale(p[1]) + HEIGHT / 2 ];
}


//// main

function draw()
{
	let i, j, k, p, lastP, star, a, b, x, y, z, c, now, dt, lineStarted;
	
	_raf(draw);
	
	now = (new Date()).getTime();
	dt = now - lastFrameTime;
	
	if (dt < 33)
	{
//		return;
	}
	
	lastFrameTime = now;
	
	if (finished)
	{
		return;
	}
	
	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	ctx.globalCompositeOperation = "lighter";
	
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = _scale(1);
//	ctx.lineCap = "round";
	
	for (i=0; i<cstars.length; i++)
	{
		star = cstars[i];
		
		k = 0;
		a = 0;
		b = 0;
		x = 0;
		y = 0;
		z = 0;
		lastP = null;
		
		for (j=0; j<settings2.steps; j++)
		{
			a += csteps[j].a;
			b += csteps[j].b;
			x += csteps[j].x;
			y += csteps[j].y;
			z -= viewZStep;
			
			ctx.strokeStyle = star.color;
			
			if (z - viewZ >= star.z - star.length && z - viewZ < star.z)
			{
				p = rpos(pos2(star.x + x, star.y + y, z, a, b));
				
				if (lastP !== null)
				{
					c = _scale(Math.pow(10, z / 10) * star.size);
					
					if (c >= 0.1)
					{
						ctx.beginPath();
						ctx.lineWidth = c;
						ctx.moveTo(lastP[0], lastP[1]);
						ctx.lineTo(p[0], p[1]);
						ctx.stroke()
					}
				}
				
				lastP = [ p[0], p[1] ];
			}
		}
		
		if (star.z + viewZ > 1)
		{
			if (starsToRestart > 0 || !hasEnd)
			{
				star.z -= 20;
				starsToRestart--;
			}
		}
	}
	
	// console.log(csteps[10]);
	
	pushStep(true);
}

function restartWormhole()
{
	generateStars();
	
	if (hasBeginning)
	{
		viewZ = -20;
	}
	else
	{
		viewZ = 0;
	}
	
	if (hasEnd)
	{
		starsToRestart = starsTotal;
	}
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
	restartWormhole();
	
	lastFrameTime = (new Date()).getTime();
	
	draw();
	
	if (hasBeginning)
	{
		body.onclick = restartWormhole;
	}
}

var _raf = window.requestAnimationFrame;

window.onload = init;
