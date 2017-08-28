"use strict";

const PALETTE_LENGTH = 1000;

let canvas = null;
let ctx = null;
let body = null;
let gui = null;
let prng = null;
let _seed = 0;

let palette = [];

let settings = {
	h1: 0,
	s1: 0.2,
	l1: 0.3,
	
	h2: 0.16,
	s2: 1.0,
	l2: 0.59,
	
	pow: 3.42,
	
	density: 0.32,
	
	autoUpdate: false,
	
	moons: 0
};



function buildPalette()
{
	let i, a;
	
	for (i=0; i<PALETTE_LENGTH; i++)
	{
		a = i / PALETTE_LENGTH;
		
		palette[i] = hsla2rgba_(
			lerp(settings.h1, settings.h2, a),
			lerp(settings.s1, settings.s2, a),
			lerp(settings.l1, settings.l2, a),
			Math.pow(a, 1 - settings.density * 0.88)
		);
	}
}

function ball(ctx, x, y, r)
{
	let i, b;
	const a = 500;
	
	for (i=0; i<a; i++)
	{
		b = i/a;
		
		ctx.beginPath();
		ctx.arc(x + (b/2) * r, y + (b/2) * r, r * (b * b * b), 0, 2 * Math.PI);
		ctx.fill();
	}
}

function draw()
{
	let i, n, c1, c2, a, p1, p2;
	
	a = 1;
	
	if (settings.autoUpdate)
	{
		buildPalette();
	}
	
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.fillStyle = "#fff";
	
	prng.seed = _seed;
	
	ctx.fillStyle = "rgba(255,255,255,0.5)";
	for (i=0; i<50; i++)
	{
		ctx.beginPath();
		ctx.arc(prng.random() * WIDTH, prng.random() * HEIGHT, _scale(1), 0, 2 * Math.PI);
		ctx.fill();
	}
	
	// sun color!
	ctx.fillStyle = "rgba(255,230,190,0.1)";
	
//	for (i=0; i<settings.moons; i++)
	{
		ball(ctx, prng.random() * WIDTH, prng.random() * HEIGHT / 2, _scale(5 + 25 * prng.random()));
	}
//	ctx.globalCompositeOperation = 'screen';
	
	for (i=0; i<HEIGHT; i++)
	{
		n = Math.floor(i / HEIGHT * PALETTE_LENGTH);
		
		ctx.fillStyle = palette[n];
		ctx.fillRect(0, i, WIDTH, 1);
	}
	
	ctx.globalCompositeOperation = 'screen';
	
	// sun color!
	a = _scale(30 + 30 * prng.random());
	p1 = prng.random() * WIDTH;
	p2 = prng.random() * HEIGHT / 2 + HEIGHT / 2;
	
	ctx.fillStyle = "rgba(255,255,255,0.3)";
	ball(ctx, p1, p2, a);
	
	_raf(draw);
}

function randomize()
{
	_seed = Math.floor(Math.random() * 1000000);
	
	settings.h1 = Math.random();
	if (Math.random() < 0.5)
	{
		settings.h2 = settings.h1 - 0.1 - Math.random() * 0.5;
	}
	else
	{
		settings.h2 = settings.h1 + 0.1 + Math.random() * 0.5;
		settings.h2 = settings.h1 + 0.1 + Math.random() * 0.5;
	}
	settings.s2 = 0.2 + Math.random() * 0.5;
	settings.pow = Math.random();
	settings.density = Math.random();
	settings.moons = Math.floor(Math.pow(Math.random(), 4) * 3);
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
	
	settings.update = buildPalette;
	
	randomize();
	
	gui = new dat.gui.GUI();
	
	tmp = gui.addFolder("Atmosphere");
	
	tmp.add(settings, 'h1').min(0).max(1).step(0.01);
	tmp.add(settings, 's1').min(0).max(1).step(0.01);
	tmp.add(settings, 'l1').min(0).max(1).step(0.01);
	
	tmp.add(settings, 'h2').min(0).max(1).step(0.01);
	tmp.add(settings, 's2').min(0).max(1).step(0.01);
	tmp.add(settings, 'l2').min(0).max(1).step(0.01);
	
	tmp.add(settings, 'pow').min(0.1).max(10);
	
	tmp.add(settings, 'density').min(0).max(1).step(0.01);
	tmp.add(settings, 'autoUpdate');
	
	tmp.open();
	
	buildPalette();
	
	draw();
}

var _raf = window.requestAnimationFrame;

window.onload = init;
