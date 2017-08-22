"use strict";

let canvas = null;
let ctx = null;
let body = null;
let gui = null;


let settings = {
	h1: 0,
	s1: 0.2,
	l1: 0.3,
	
	h2: 0.15,
	s2: 1.0,
	l2: 0.5,
	
	height: 0.5,
	
	mode: 1,
	pow: 1
};

// function lerp(a, b, x)
// {
// 	return a + (b - a) * (x * x);
// }

function lerp(a, b, x)
{
	return a + (b - a) * Math.pow(x, settings.pow);
}

function hsl2rgbx(h, s, l)
{
	// thanks Mohsen! https://stackoverflow.com/a/9493060/460571
	let p, q, r, g, b;
	
	let a = function(p, q, t)
	{
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1/6) return p + (q - p) * 6 * t;
		if (t < 3/6) return q;
		if (t < 4/6) return p + (q - p) * 6 * (4/6 - t);
		return p
	}
	
	if (l < 0.5)
	{
		q = l * (1 + s);
	}
	else
	{
		q = l + s - l * s;
	}
	
	p = 2 * l - q;
	
	r = Math.floor(a(p, q, h + 1/3) * 256);
	g = Math.floor(a(p, q, h) * 256);
	b = Math.floor(a(p, q, h - 1/3) * 256);
	
	return [ r, g, b ];
}

function hsl2rgb(h, s, l)
{
	let a;
	
	a = hsl2rgbx(h, s, l);
	
	return "rgba(" + a[0] + "," + a[1] + "," + a[2] + ", 1)";
}

function draw()
{
	let i, n, c1, c2, a;
	n = 300;
	
	a = 1;
	
	if (settings.mode == 1)
	{
		for (i=0; i<1; i+=1 / n)
		{
			ctx.fillStyle = hsl2rgb(
				lerp(settings.h1, settings.h2, i),
				lerp(settings.s1, settings.s2, i),
				lerp(settings.l1, settings.l2, i)
			);
			ctx.fillRect(0, i * 300, 300, 300 / n);
		}
	}
	else
	{
		c1 = hsl2rgbx(settings.h1, settings.s1, settings.l1, 1);
		c2 = hsl2rgbx(settings.h2, settings.s2, settings.l2, 1);
		
		for (i=0; i<1; i+=1 / n)
		{
			ctx.fillStyle = "rgba(" + Math.floor(lerp(c1[0], c2[0], i)) + "," + Math.floor(lerp(c1[1], c2[1], i)) + "," + Math.floor(lerp(c1[2], c2[2], i)) + "," + a + ")";
			ctx.fillRect(0, i * 300, 300, 300 / n);
		}
	}
	
	_raf(draw);
}

function init()
{
	canvas = document.createElement("canvas");
	
	canvas.width = 300;
	canvas.height = 300;
	ctx = canvas.getContext("2d");
	
	body = document.body;
	body.appendChild(canvas);
	
	gui = new dat.gui.GUI();
	
	gui.add(settings, 'h1').min(0).max(1);
	gui.add(settings, 's1').min(0).max(1);
	gui.add(settings, 'l1').min(0).max(1);
	
	gui.add(settings, 'h2').min(0).max(1);
	gui.add(settings, 's2').min(0).max(1);
	gui.add(settings, 'l2').min(0).max(1);
	
	gui.add(settings, 'mode').min(1).max(2).step(1);
	gui.add(settings, 'pow').min(0.1).max(10);
	
	draw();
}

var _raf = window.requestAnimationFrame;

window.onload = init;
