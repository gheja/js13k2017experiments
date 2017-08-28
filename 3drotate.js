"use strict";

const PALETTE_LENGTH = 1000;

let canvas = null;
let ctx = null;
let body = null;
let gui = null;

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
	for (i=0; i<settings.n; i++)
	{
		p = pos2(cos(i/settings.n) * 50, sin(i/settings.n) * 50, settings.a, settings.b);
		
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
	
	for (i=0; i<settings.n; i++)
	{
		ctx.beginPath();
		
		p = pos2(-50, (i/settings.n) * 200 - 100, settings.a, settings.b);
		p[0] += WIDTH / 2;
		p[1] += HEIGHT / 2;
		ctx.moveTo(p[0], p[1]);
		
		p = pos2(50, (i/settings.n) * 200 - 100, settings.a, settings.b);
		p[0] += WIDTH / 2;
		p[1] += HEIGHT / 2;
		ctx.lineTo(p[0], p[1]);
		
		ctx.stroke();
	}
	
	if (settings.autoB)
	{
		settings.b += 0.005;
		if (settings.b > 1)
		{
			settings.b -= 1;
		}
	}
	
	_raf(draw);
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
	
	gui = new dat.gui.GUI();
	
	tmp = gui.addFolder("3D rotate");
	
	tmp.add(settings, 'a').min(0).max(1).step(0.01);
	tmp.add(settings, 'b').min(0).max(1).step(0.01).listen();
	tmp.add(settings, 'distortion').min(0).max(0.02).step(0.0001);
	tmp.add(settings, 'n').min(3).max(30).step(1);
	tmp.add(settings, 'z').min(0).max(1).step(0.01);
	
	tmp.add(settings, 'autoB');
	tmp.add(settings, 'autoUpdate');
	
	tmp.open();
	
	draw();
}

var _raf = window.requestAnimationFrame;

window.onload = init;
