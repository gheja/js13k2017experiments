"use strict";

let canvas = null;
let ctx = null;
let body = null;
let gui = null;
let frameNumber = 0;

let settings = {
};

let system = {
	name: "e",
	bodies: []
};

function _x(x)
{
	return WIDTH / 2 + _scale(x);
}

function _y(y)
{
	return HEIGHT / 2 + _scale(y);
}

function generateBody(parent, color, size, r, speed)
{
	return {
		parent: parent,
		color: color,
		radius: size * (Math.random() + 0.8),
		orbitRadius: r,
		position: Math.random(),
		speed: speed * (Math.random() + 0.8) * 5
	};
}

function regenerate()
{
	let i, j, a, b, c;
	
	system.bodies.length = 0;
	
	system.bodies.push(generateBody(null, "#ff0", 13, 0, 0));
	
	b = 20;
	
	for (i=0; i<5; i++)
	{
		a = system.bodies.push(generateBody(system.bodies[0], "#07d", 5, i * 30 + 50, 0.0001)) - 1;
		
		c = Math.floor(Math.random() * 3);
		
		for (j=0; j<c; j++)
		{
			system.bodies.push(generateBody(system.bodies[a], "#999", 2, j * 10 + 15, 0.0005));
		}
	}
}

function updateBodies()
{
	let i, b;
	
	for (i=0; i<system.bodies.length; i++)
	{
		b = system.bodies[i];
		b.position += b.speed;
		
		if (b.parent == null)
		{
			b.centerX = 0;
			b.centerY = 0;
			b.positionX = 0;
			b.positionY = 0;
		}
		else
		{
			b.centerX = b.parent.positionX;
			b.centerY = b.parent.positionY;
			b.positionX = b.centerX + cos(b.position) * b.orbitRadius;
			b.positionY = b.centerY + sin(b.position) * b.orbitRadius;
		}
	}
}

function drawBodies()
{
	let i, j, a, b, c, stripes;
	
	ctx.lineCap = "round";
	
	for (i=0; i<system.bodies.length; i++)
	{
		b = system.bodies[i];
		
		if (b.parent == system.bodies[0])
		{
			ctx.lineWidth = _scale(1.5);
		}
		else
		{
			ctx.lineWidth = _scale(1);
		}
		
		stripes = b.orbitRadius * 0.8;
		
		for (j=0; j<stripes; j++)
		{
			c = ((stripes - j) / stripes);
			
			if (b.parent == system.bodies[0])
			{
				ctx.strokeStyle = "rgba(255,220,30," + c + ")";
			}
			else
			{
				ctx.strokeStyle = "rgba(0,200,255," + c + ")";
			}
			a = b.position * PI2 - j * 2 * PI2/(stripes * 2 * 1.1);
			ctx.beginPath();
			ctx.arc(_x(b.centerX), _y(b.centerY), _scale(b.orbitRadius), a - PI2 / (stripes * 5), a);
			ctx.stroke();
		}
	}
	
	ctx.globalCompositeOperation = "source-over";
	
	for (i=0; i<system.bodies.length; i++)
	{
		b = system.bodies[i];
		
		ctx.fillStyle = b.color;
		ctx.beginPath();
		ctx.arc(_x(b.positionX), _y(b.positionY), _scale(b.radius), 0, PI2);
		ctx.fill();
	}
}

function draw()
{
	_raf(draw);
	
	frameNumber++;
	
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	updateBodies();
	drawBodies();
}

function updateFps()
{
	document.title = frameNumber;
	frameNumber = 0;
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
	
	// lastFrameTime = (new Date()).getTime();
	
	draw();
	
	body.onclick = regenerate;
	regenerate();
	
	window.setInterval(updateFps, 1000);
}

var _raf = window.requestAnimationFrame;

window.onload = init;
