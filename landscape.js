"use strict";

const PALETTE_LENGTH = 5000;

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
	
	position: 0,
	
	autoUpdate: false,
	
	stars: [],
	moons: [],
	sun: null,
	hill1: [],
	hill2: []
};

let _p = 0;



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
	
	_raf(draw);
	
	settings.position += 0.0025;
	if (settings.position > 1.5)
	{
		regenerate();
		settings.position = 0;
	}
	
	_p = clamp(settings.position, 0, 1);
	
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
		_arc(settings.stars[i].x, _parallax(settings.stars[i].y, 30), 1, 0, 1, 1);
	}
	
	// sun mask - no stars between planet and sun please
	ctx.fillStyle = "#000";
	_arc(settings.sun.x, _parallax(settings.sun.y, 20), settings.sun.radius, 0, 1, 1);
	
	// moons
	for (i=0; i<settings.moons.length; i++)
	{
		ctx.fillStyle = settings.moons[i].color;
		_arc(settings.moons[i].x, _parallax(settings.moons[i].y, 10), settings.moons[i].radius, 0, 1, 1);
	}
	
	// atmosphere
	for (i=0; i<HEIGHT; i++)
	{
		n = clamp(Math.floor((i / HEIGHT * PALETTE_LENGTH) * (Math.pow(_p, 0.9))), 0, PALETTE_LENGTH - 1);
		
		ctx.fillStyle = palette[n];
		ctx.fillRect(0, i, WIDTH, 1);
	}
	
	// sun
	ctx.globalCompositeOperation = 'screen';
	ctx.fillStyle = settings.sun.color;
	_arc(settings.sun.x, _parallax(settings.sun.y, 20), settings.sun.radius, 0, 1, 1);
	
	function puthill(hill, top, p)
	{
		let i;
		
		ctx.beginPath();
		ctx.moveTo(0, _scale(_parallax(top, p)) + HEIGHT / 2);
		for (i=0; i<hill.length; i++)
		{
			ctx.lineTo((i + 1) * WIDTH / hill.length, _scale(_parallax(hill[i] * 30 + top, p)) + HEIGHT / 2);
		}
		ctx.lineTo(WIDTH, HEIGHT);
		ctx.lineTo(0, HEIGHT);
		ctx.fill();
	}
	
	// hill mask
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = "#000";
	puthill(settings.hill1, 80.5, 2);
	
	// hills
	ctx.globalCompositeOperation = 'screen';
	puthill(settings.hill1, 80.5, 2);
	ctx.fillStyle = hsla2rgba_(0.15, 1, 0.6, 0.9);
	puthill(settings.hill1, 80, 2);
	puthill(settings.hill2, 120, 1.6);
	
	ctx.globalCompositeOperation = 'source-over';
	// sun color:
	ctx.fillStyle = hsla2rgba_(0.0, 1, 0.5, 0.33);
	puthill(settings.hill1, 80, 2);
	// ctx.fillRect(0, 0, WIDTH, HEIGHT);
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
			y: randPlusMinus(50) - 150,
			color: "#fff",
			radius: randFloat() * 25 + 5
		});
	}
	
	settings.sun = {
		x: randPlusMinus(180),
		y: randPlusMinus(50) + 100,
		color: hsla2rgba_(0.0, 1, 0.5, 1),
		radius: randFloat() * 30 + 50
	};
	
	settings.hill1.length = 0;
	settings.hill2.length = 0;
	for (i=0; i<=10; i++)
	{
		settings.hill1.push(randFloat());
		settings.hill2.push(randFloat());
	}
	
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
	tmp.add(settings, 'position').min(0).max(1).listen();
	tmp.add(settings, 'autoUpdate');
	tmp.add(window, 'regenerate');
	
	tmp.open();
	
	regenerate();
	
	draw();
}

var _raf = window.requestAnimationFrame;

window.onload = init;
