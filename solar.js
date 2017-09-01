"use strict";

const TYPE_STAR = 0;
const TYPE_PLANET = 1;
const TYPE_MOON = 2;

let canvas = null;
let ctx = null;
let body = null;
let gui = null;
let frameNumber = 0;

// [ [ h, s, l, type ], [ ... ], ... ]
let BODY_TYPE_DEFINITIONS =
[
	// star == 0
	[ [ 0.13, 1.0, 0.7, "warm" ], [ 0.5, 0.4, 0.85, "cold" ], [ 1.0, 0.8, 0.4, "dying red" ] ],
	
	// planet == 1
	[ [ 0.55, 0.5, 0.8, "icy" ], [ 0.25, 0.5, 0.5, "forest" ], [ 0.12, 0.7, 0.5, "deserted" ], [ 0, 0.5, 0.5, "rusty red" ] ],
	
	// moon == 2
	[ [ 0.55, 0.2, 0.9, "icy" ], [ 0, 0.0, 0.3, "rocky" ] ]
];

let settings = {
};

let system = {
	name: "e",
	bodies: []
};

function generateBody(parent, size, r, speed, type)
{
	let a = {
		parent: parent,
		def: arrayRandom(BODY_TYPE_DEFINITIONS[type]),
		radiusBase: size,
		radiusScale: Math.random(),
		radius: 0,
		orbitRadius: r,
		position: Math.random(),
		speed: speed * (Math.random() + 0.5) * 5,
		type: type,
		childCount: 0
	};
	
	a.radius = a.radiusBase * (a.radiusScale + 0.8);
	
	if (parent)
	{
		parent.childCount++;
	}
	
	// randomize color a bit
	a.def[0] *= 1 + (Math.random() - 0.5) * 0.05;
	
	return a;
}

function regenerate()
{
	let i, j, a, b, c;
	
	system.bodies.length = 0;
	
	system.bodies.push(generateBody(null, 13, 0, 0, TYPE_STAR));
	
	b = 20;
	
	for (i=0; i<5; i++)
	{
		a = system.bodies.push(generateBody(system.bodies[0], 5, i * 30 + 50, 0.0001, TYPE_PLANET)) - 1;
		
		c = Math.floor(Math.random() * 3);
		
		for (j=0; j<c; j++)
		{
			system.bodies.push(generateBody(system.bodies[a], 2, j * 10 + 15, 0.0005, TYPE_MOON));
		}
	}
	
	describeBody(system.bodies[2]);
}

function updateBodies()
{
	let i, b;
	
	for (i=0; i<system.bodies.length; i++)
	{
		b = system.bodies[i];
		b.position += b.speed;
		
		// TODO: dual stars?
		// if (b.parent == null)
		
		if (b.type == TYPE_STAR)
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
		
		if (b.type == TYPE_PLANET)
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
			
/*
			if (Math.floor(frameNumber + b.orbitRadius) % 150 == j)
			{
				ctx.strokeStyle = "#fff";
			}
			else
			{
*/
				if (b.type == TYPE_PLANET)
				{
					// ctx.strokeStyle = "rgba(255,220,30," + c + ")";
					ctx.strokeStyle = hsla2rgba_(b.parent.def[0], b.parent.def[1], b.parent.def[2], c);
				}
				else
				{
					ctx.strokeStyle = "rgba(0,200,255," + c + ")";
				}
/*
			}
*/
			a = b.position - j * 2 * 1/(stripes * 2 * 1.1);
			// a = j * 2 * 1/(stripes * 2 * 1.1);
			
			_arc(b.centerX, b.centerY, b.orbitRadius, a - 1 / (stripes * 5), a, 0, 1);
		}
	}
	
	ctx.globalCompositeOperation = "source-over";
	
	for (i=0; i<system.bodies.length; i++)
	{
		b = system.bodies[i];
		
		// planet
		if (b.type == TYPE_PLANET)
		{
			// atmosphere
			ctx.lineWidth = _scale(1);
			ctx.strokeStyle = hsla2rgba_(0.4, 0.2, 0.8, 0.7);
			_arc(b.positionX, b.positionY, b.radius * 1.2, 0, 1, 0, 1);
		}
		
		ctx.fillStyle = hsla2rgba_(b.def[0], b.def[1], b.def[2], 1);
		_arc(b.positionX, b.positionY, b.radius, 0, 1, 1);
		
		// no shadow on the star
		if (b.type == TYPE_STAR)
		{
			continue;
		}
		
		// planet
		if (b.type == TYPE_PLANET)
		{
			c = b.position + 0.25;
		}
		// moon
		else
		{
			c = b.parent.position + 0.25;
		}
		
		// sunny side
		ctx.fillStyle = hsla2rgba_(system.bodies[0].def[0], system.bodies[0].def[1], system.bodies[0].def[2], 0.2);
		_arc(b.positionX, b.positionY, b.radius, 0, 1, 1);
		
		// shadow
		ctx.fillStyle = "rgba(0,0,0,0.4)";
		_arc(b.positionX, b.positionY, b.radius, c - 0.5, c, 1);
	}
}

function bodySizeString(b)
{
	if (b.radiusScale < 0.15)
	{
		return "tiny";
	}
	
	if (b.radiusScale < 0.25)
	{
		return "small";
	}
	
	if (b.radiusScale < 0.75)
	{
		return "average";
	}
	
	if (b.radiusScale < 0.85)
	{
		return "big";
	}
	
	return "huge";
}

function moonCountString(b)
{
	if (b.childCount == 0)
	{
		return "no moons";
	}
	
	if (b.childCount == 1)
	{
		return "a moon";
	}
	
	return "a few moons";
}

function describeBody(b)
{
	let star;
	let s;
	
	s = "Oh, now I remember! Must be ";
	
	if (b.type == TYPE_MOON)
	{
		s += "on the [" + bodySizeString(b) + "] [" + b.def[3] + "] moon of ";
		
		// hack but cheap
		b = b.parent;
	}
	else
	{
		s += "on ";
	}
	
	star = b.parent;
	s += "a [" + bodySizeString(b) + "] [" + b.def[3] + "] planet [with " + moonCountString(b) + "] ";
	
	s += "orbiting a [" + star.def[3] + "] sun."
	
	console.log(s);
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
	
	// window.setInterval(updateFps, 1000);
}

var _raf = window.requestAnimationFrame;

window.onload = init;
