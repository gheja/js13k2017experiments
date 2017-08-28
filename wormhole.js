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
	
	va = clamp(va + rand(0.002), -0.05, 0.05);
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



//// main

function draw()
{
	let i, j, k, p, lastP, star, a, b, x, y, z, c, now, dt, lineStarted;
	
	_raf(draw);
	
	now = (new Date()).getTime();
	dt = now - lastFrameTime;
	
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
