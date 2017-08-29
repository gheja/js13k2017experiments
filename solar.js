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

function _arc(x, y, r, a, b, fill, stroke)
{
	ctx.beginPath();
	ctx.arc(_x(x), _y(y), _scale(r), a * PI2, b * PI2);
	if (fill)
	{
		ctx.fill();
	}
	
	if (stroke)
	{
		ctx.stroke();
	}
}

function generateBody(parent, color, size, r, speed, planet)
{
	return {
		parent: parent,
		color: color,
		radius: size * (Math.random() + 0.8),
		orbitRadius: r,
		position: Math.random(),
		speed: speed * (Math.random() + 0.8) * 5,
		isPlanet: planet
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
		a = system.bodies.push(generateBody(system.bodies[0], "#07d", 5, i * 30 + 50, 0.0001, 1)) - 1;
		
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
		
		if (b.isPlanet)
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
			a = b.position - j * 2 * 1/(stripes * 2 * 1.1);
			
			_arc(b.centerX, b.centerY, b.orbitRadius, a - 1 / (stripes * 5), a, 0, 1);
		}
	}
	
	ctx.globalCompositeOperation = "source-over";
	
	for (i=0; i<system.bodies.length; i++)
	{
		b = system.bodies[i];
		
		// sunny side
		if (b.isPlanet)
		{
			ctx.fillStyle = "rgba(255,255,0,0.4)";
			_arc(b.positionX, b.positionY, b.radius * 1.2, 0, 1, 1);
		}
		
		ctx.fillStyle = b.color;
		_arc(b.positionX, b.positionY, b.radius, 0, 1, 1);
		
		// no shadow on the star
		if (b.parent == null)
		{
			continue;
		}
		
		// planet
		if (b.isPlanet)
		{
			c = b.position + 0.25;
		}
		// moon
		else
		{
			c = b.parent.position + 0.25;
		}
		
		// sunny side
		ctx.fillStyle = "rgba(255,255,0,0.2)";
		_arc(b.positionX, b.positionY, b.radius, c, c + 0.5, 1);
		
		// shadow
		ctx.fillStyle = "rgba(0,0,0,0.44)";
		_arc(b.positionX, b.positionY, b.radius, c - 0.5, c, 1);
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
