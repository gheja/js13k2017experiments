"use strict";

const PALETTE_LENGTH = 1000;

let canvas = null;
let ctx = null;
let body = null;
let gui = null;

const canvas_width = 416;
const canvas_height = 234;

let palette = [];

let settings = {
	h1: 0.77,
	s1: 0.2,
	l1: 0.3,
	
	h2: 0.15,
	s2: 1.0,
	l2: 0.5,
	
	height: 1.5,
	
	mode: 1,
	pow: 0.5,
	
	autoUpdate: false
};

// function lerp(a, b, x)
// {
// 	return a + (b - a) * (x * x);
// }

function lerp(a, b, x)
{
	return a + (b - a) * Math.pow(x, settings.pow);
}

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

function buildPalette()
{
	let i;
	
	for (i=0; i<PALETTE_LENGTH; i++)
	{
		palette[i] = hsla2rgba_(
			lerp(settings.h1, settings.h2, i/PALETTE_LENGTH),
			lerp(settings.s1, settings.s2, i/PALETTE_LENGTH),
			lerp(settings.l1, settings.l2, i/PALETTE_LENGTH),
			1
		);
	}
}

function draw()
{
	let i, n, c1, c2, a;
	
	a = 1;
	
	if (settings.autoUpdate)
	{
		buildPalette();
	}
	
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, 300, 300);
	
	if (settings.mode == 1)
	{
		for (i=0; i<canvas_height; i++)
		{
			a = i * settings.height;
			
			n = Math.floor(i / canvas_height * PALETTE_LENGTH);
			
			ctx.fillStyle = palette[n];
			
			ctx.fillRect(0, i, canvas_width, 1);
		}
	}
	
	_raf(draw);
}

function init()
{
	canvas = document.createElement("canvas");
	
	canvas.width = canvas_width;
	canvas.height = canvas_height;
	ctx = canvas.getContext("2d");
	
	body = document.body;
	body.appendChild(canvas);
	
	settings.update = buildPalette;
	
	gui = new dat.gui.GUI();
	
	gui.add(settings, 'h1').min(0).max(1).step(0.01);
	gui.add(settings, 's1').min(0).max(1).step(0.01);
	gui.add(settings, 'l1').min(0).max(1).step(0.01);
	
	gui.add(settings, 'h2').min(0).max(1).step(0.01);
	gui.add(settings, 's2').min(0).max(1).step(0.01);
	gui.add(settings, 'l2').min(0).max(1).step(0.01);
	
	gui.add(settings, 'mode').min(1).max(2).step(1);
	gui.add(settings, 'pow').min(0.1).max(10);
	
	gui.add(settings, 'height').min(0).max(10).step(0.01);
	gui.add(settings, 'autoUpdate');
	
	buildPalette();
	
	draw();
}

var _raf = window.requestAnimationFrame;

window.onload = init;
