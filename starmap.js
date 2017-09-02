"use strict";

let canvas = null;
let ctx = null;
let body = null;
let gui = null;
let lastFrameTime = 0;

let stars = [
];

let settings = {
};

const STAR_COUNT = 30;
const STAR_DISTANCE_TARGET = 30;
const STAR_DISTANCE_ITERATIONS = 100;

function distance(p1, p2)
{
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function draw()
{
	let i;
	
	_raf(draw);
	
	lastFrameTime = (new Date()).getTime();
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	ctx.fillStyle = "#fff";
	ctx.strokeStyle = "#333";
	ctx.lineWidth = _scale(1);
	for (i=0; i<stars.length; i++)
	{
		_arc(stars[i].x, stars[i].y, 1, 0, 1, 1);
		_arc(stars[i].x, stars[i].y, STAR_DISTANCE_TARGET, 0, 1, 0, 1);
	}
}

function regenerate()
{
	let i, j, k, a, min;
	
	stars.length = 0;
	
	for (i=0; i<STAR_COUNT; i++)
	{
		for (j=0; j<STAR_DISTANCE_ITERATIONS; j++)
		{
			a = {
				x: randPlusMinus(180),
				y: randPlusMinus(180)
			}
			
			// don't generate stars too close
			min = 1000;
			for (k=0; k<i; k++)
			{
				min = Math.min(min, distance(a, stars[k]));
			}
			
			if (min > STAR_DISTANCE_TARGET)
			{
				break;
			}
		}
		
		stars.push(a);
	}
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
	
	lastFrameTime = (new Date()).getTime();
	
	draw();
	
	body.onclick = regenerate;
	regenerate();
}

var _raf = window.requestAnimationFrame;

window.onload = init;
