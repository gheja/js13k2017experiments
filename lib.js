"use strict";

const PI = Math.PI;
const PI2 = 2 * PI;
// const PI2 = 6.283;

var _raf = window.requestAnimationFrame;

function _scale(x)
{
	return x * SCALE;
}

function _x(x)
{
	return WIDTH / 2 + _scale(x);
}

function _y(y)
{
	return HEIGHT / 2 + _scale(y);
}

function _parallax(x, distance, weight)
{
//	return x + 1000 * Math.pow(1, -distance) * (1-_p);
	return x + (weight ? weight : 400) * (1 / (distance)) * (1 - _p);
}

function screenCoordinates(p)
{
	return [ _x(p[0]), _y(p[1]) ];
}

function clamp(x, min, max)
{
	if (x < min)
	{
		return min;
	}
	
	if (x > max)
	{
		return max;
	}
	
	return x;
}

function sin(x)
{
	return Math.sin(x * PI2);
}

function cos(x)
{
	return Math.cos(x * PI2);
}

function randFloat()
{
	return Math.random();
}

function randPlusMinus(x)
{
	return (randFloat() - 0.5) * x * 2;
}

function _hackClone(x)
{
	return JSON.parse(JSON.stringify(x));
}

function goFullScreen()
{
	// based on https://developers.google.com/web/fundamentals/native-hardware/fullscreen/
/*
	let documentElement = window.document.documentElement;
	let request = documentElement.requestFullscreen || documentElement.mozRequestFullScreen || documentElement.webkitRequestFullScreen || documentElement.msRequestFullscreen;
	request.call(documentElement);
*/
	let d = window.document.documentElement;
	(d.requestFullscreen || d.mozRequestFullScreen || d.webkitRequestFullScreen || d.msRequestFullscreen).call(d);
}

function arrayRandom(a)
{
	return a[Math.floor(randFloat() * a.length)];
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



//// landscape
function hslaConvert(p, q, t)
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
	
	r = Math.floor(hslaConvert(p, q, h + 1/3) * 255);
	g = Math.floor(hslaConvert(p, q, h) * 255);
	b = Math.floor(hslaConvert(p, q, h - 1/3) * 255);
	
	return [ r, g, b, a ];
}

function hsla2rgba_(h, s, l, a)
{
	let c;
	
	c = hsla2rgba(h, s, l, a);
	
	return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + c[3] + ")";
}



//// 3drotate
function pos2(x, y, z, a, b)
{
	let s = sin(b);
	let c = cos(b);
	let s2 = sin(a);
	let c2 = cos(a);
	let p, x2, y2, w;
	
	w = Math.pow(10, z / 10);
	
	x2 = c2 * x + s2 * y;
	y2 = s2 * x - c2 * y;
	
	return [
		(x2 * c) * w,
		(y2 + s * x2 * y2 * settings.distortion) * w
	];
}

function getDistance(p1, p2)
{
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getAngle(p1, p2)
{
	return Math.atan2(p1.y - p2.y, p2.x - p1.x) / PI2;
}



//// canvas layers
function layerCreate(name, drawFunction)
{
	let a;
	
	a = { name: name, visible: true, canvas: document.createElement("canvas"), draw: drawFunction };
	
	// TODO: resize on resize
	a.canvas.width = WIDTH;
	a.canvas.height = HEIGHT;
	a.ctx = a.canvas.getContext("2d");
	
	body.appendChild(a.canvas);
	
	return _layers.push(a) - 1;
}

function draw()
{
	let i;
	
	_raf(draw);
	
	_frameNumber++;
	
	for (i=0; i<_layers.length; i++)
	{
		if (_layers[i].visible)
		{
			canvas = _layers[i].canvas;
			ctx = _layers[i].ctx;
			_layers[i].draw.call();
		}
	}
}
