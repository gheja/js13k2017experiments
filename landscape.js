"use strict";

const PALETTE_LENGTH = 1000;

let canvas = null;
let ctx = null;
let body = null;
let gui = null;
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
	
	stars: [],
	moons: [],
	sun: null
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
		ctx.arc(x + (b/2) * r, y + (b/2) * r, r * (b * b * b), 0, PI2);
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
	
	ctx.fillStyle = "rgba(255,255,255,0.5)";
	for (i=0; i<settings.stars.length; i++)
	{
		_arc(settings.stars[i].x, settings.stars[i].y, 1, 0, 1, 1);
	}
	
	for (i=0; i<settings.moons.length; i++)
	{
		ctx.fillStyle = settings.moons[i].color;
		_arc(settings.moons[i].x, settings.moons[i].y, settings.moons[i].radius, 0, 1, 1);
	}
	
	for (i=0; i<HEIGHT; i++)
	{
		n = Math.floor(i / HEIGHT * PALETTE_LENGTH);
		
		ctx.fillStyle = palette[n];
		ctx.fillRect(0, i, WIDTH, 1);
	}
	
	ctx.globalCompositeOperation = 'screen';
	ctx.fillStyle = settings.sun.color;
	_arc(settings.sun.x, settings.sun.y, settings.sun.radius, 0, 1, 1);
	
	_raf(draw);
}

function regenerate()
{
	let i, n;
	
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
	
	n = Math.floor(randFloat() * 3);
	
	settings.stars.length = 0;
	for (i=0; i<500; i++)
	{
		settings.stars.push({ x: randPlusMinus(1200), y: randPlusMinus(1200) });
	}
	
	settings.moons.length = 0;
	for (i=0; i<n; i++)
	{
		settings.moons.push({
			x: randPlusMinus(180),
			y: randPlusMinus(100) - 100,
			color: "#fff",
			radius: randFloat() * 25 + 5
		});
	}
	
	settings.sun = {
		x: randPlusMinus(180),
		y: randPlusMinus(100) + 100,
		color: "#fff",
		radius: randFloat() * 25 + 30
	};
	
	buildPalette();
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
	
	settings.update = buildPalette;
	
	
	gui = new dat.gui.GUI();
	
	tmp = gui.addFolder("Atmosphere");
	
	tmp.add(settings, 'h1').min(0).max(1).step(0.01).listen();
	tmp.add(settings, 's1').min(0).max(1).step(0.01).listen();
	tmp.add(settings, 'l1').min(0).max(1).step(0.01).listen();
	
	tmp.add(settings, 'h2').min(0).max(1).step(0.01).listen();
	tmp.add(settings, 's2').min(0).max(1).step(0.01).listen();
	tmp.add(settings, 'l2').min(0).max(1).step(0.01).listen();
	
	tmp.add(settings, 'pow').min(0.1).max(10).listen();
	
	tmp.add(settings, 'density').min(0).max(1).step(0.01).listen();
	tmp.add(settings, 'autoUpdate');
	tmp.add(window, 'regenerate');
	
	tmp.open();
	
	regenerate();
	
	draw();
}

var _raf = window.requestAnimationFrame;

window.onload = init;
