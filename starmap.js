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

const PATH_STEPS = 10;
const PATH_STEP_DISTANCE = 100;
const PATH_ITERATIONS = 100;

const STAR_COUNT = 40;
const STAR_DISTANCE_TARGET = 30;
const STAR_DISTANCE_ITERATIONS = 100;

let arr = {
	success: false,
	steps: [],
	stepsShown: PATH_STEPS
};

function getDistance(p1, p2)
{
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function draw()
{
	let i, a;
	
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
	
	ctx.strokeStyle = "#ea0";
	for (i=0; i<Math.min(arr.stepsShown, arr.steps.length); i++)
	{
		a = arr.steps[i];
		_arc(a.star.x, a.star.y, PATH_STEP_DISTANCE, a.angleMin, a.angleMax, 0, 1);
	}
	
	ctx.strokeStyle = arr.success ? "#0e0" : "#e00";
	for (i=0; i<Math.min(arr.stepsShown, arr.steps.length); i++)
	{
		a = arr.steps[i];
		_arc(a.star.x, a.star.y, 3, 0, 1, 0, 1);
	}
}

function regenerate()
{
	let i, j, k, a, b, min;
	
	stars.length = 0;
	
	for (i=0; i<STAR_COUNT; i++)
	{
		for (j=0; j<STAR_DISTANCE_ITERATIONS; j++)
		{
			a = {
				x: randPlusMinus(180),
				y: randPlusMinus(180),
				visited: false
			}
			
			// don't generate stars too close
			min = 1000;
			for (k=0; k<i; k++)
			{
				min = Math.min(min, getDistance(a, stars[k]));
			}
			
			if (min > STAR_DISTANCE_TARGET)
			{
				break;
			}
		}
		
		stars.push(a);
	}
}

function pathAddStep(a)
{
	a.star.visited = true;
	arr.steps.push(a);
}

function getAngle(p1, p2)
{
	return Math.atan2(p1.y - p2.y, p2.x - p1.x) / PI2;
}

function newPath()
{
	let i, j, k, a, b, c, current, best, angle, dist, minDist;
	
	arr.success = false;
	arr.steps.length = 0;
	
	for (i=0; i<1; i++)
	{
		arr.success = true;
		
		for (k=0; k<stars.length; k++)
		{
			stars[k].visited = false;
		}
		
		pathAddStep({
			star: arrayRandom(stars),
			angleMin: -0.3,
			angleMax: 0.3
		});
		
		for (j=0; j<PATH_STEPS; j++)
		{
			c = null;
			current = arr.steps[arr.steps.length - 1];
			
			console.log("current: " + current.angleMin + ", " + current.angleMax);
			
			minDist = 1000;
			for (k=0; k<stars.length; k++)
			{
				if (stars[k].visited)
				{
					continue;
				}
				
				dist = getDistance(current.star, stars[k]);
				angle = -getAngle(current.star, stars[k]);
				
				if (dist > PATH_STEP_DISTANCE || angle < current.angleMin || angle > current.angleMax)
				{
					continue;
				}
				
				if (dist < minDist)
				{
					c = {
						star: stars[k],
						angleMin: angle - 0.4,
						angleMax: angle + 0.4
					};
					
					minDist = dist;
				}
				
				console.log(k + ", " + dist + ", " + angle);
			}
			
			if (!c)
			{
				arr.success = false;
				break;
			}
			
			pathAddStep(c);
		}
		
		if (arr.success)
		{
			break;
		}
	}
}

function step()
{
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
	
	gui = new dat.gui.GUI();
	
	gui.add(arr, 'stepsShown').min(0).max(PATH_STEPS);
	gui.add(window, 'newPath');
	
	regenerate();
}

var _raf = window.requestAnimationFrame;

window.onload = init;
