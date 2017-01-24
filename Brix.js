var canvas = document.getElementById('theCanvas');
var context = canvas.getContext("2d");

/*-----------------------------------------------*
 * Configuration Values
 *-----------------------------------------------*/
var canvasMargin = 15;
var boardMargin = 40; /* Space from board edge to targets */
var ballTrailMaxLen = 100;

/*-----------------------------------------------*
 * Tracking values
 *-----------------------------------------------*/
var targetInfo = { length:50, height:10, edgeSpacing:5, rowSpacing: 10}; /* Used to generate targets only */
var ballInfo = { pos:{x:100, y:100}, dir: {x:3, y:5}, size:10 };
var liveTargetList = [];
var hitTargetList = [];
var ballTrail = [];
var board = {rect:{x:0, y:0, width:100, height:100} };

/*-----------------------------------------------*
 * Populate Target List
 *-----------------------------------------------*/
var populateTargetList = function()
{
	var next = {};
	
	next.y = board.rect.y + boardMargin;
	
	for (var row = 0; row < 3; row++)
	{
		next.x = board.rect.x;

		while (next.x + targetInfo.length < board.rect.x + board.rect.width)
		{
			var r = {x:next.x, y:next.y, width:targetInfo.length, height:targetInfo.height};
			var tgt = {rect:r}
			liveTargetList.push(tgt);

			next.x += targetInfo.length + targetInfo.edgeSpacing;
		}
		
		next.y += targetInfo.height + targetInfo.rowSpacing;
	}
}

/*-----------------------------------------------*
 * Render Live Targets
 *-----------------------------------------------*/
var renderLiveTargets = function()
{
	context.fillStyle ="red";

	for (var i = 0; i < liveTargetList.length; i++)
	{
		var tgt = liveTargetList[i];
		context.beginPath();
		context.rect(tgt.rect.x, tgt.rect.y, tgt.rect.width, tgt.rect.height);
		context.fill();
	}
}

/*-----------------------------------------------*
 * Render Hit Targets
 *-----------------------------------------------*/
var renderHitTargets = function()
{
	context.lineJoin = "square";
	context.strokeStyle ="lightGray";
	for (var i = 0; i < hitTargetList.length; i++)
	{
		var tgt = hitTargetList[i];
		context.beginPath();
		context.rect(tgt.rect.x, tgt.rect.y, tgt.rect.width, tgt.rect.height);
		context.stroke();
	}
}

/*-----------------------------------------------*
 * 
 *-----------------------------------------------*/
var renderBall = function()
{
	context.fillStyle = "blue";
	context.beginPath();
	context.rect(ballInfo.pos.x, ballInfo.pos.y, ballInfo.size, ballInfo.size);
	context.fill();
}

/*-----------------------------------------------*
 * 
 *-----------------------------------------------*/
var renderBallTrail = function()
{
	for (var i = 0; i < ballTrail.length; i++)
	{
		var b = ballTrail[i];
		context.strokeStyle ="lightGray";
		context.beginPath();
		context.rect(b.pos.x, b.pos.y, b.size, b.size);
		context.stroke();
	}
}

/*-----------------------------------------------*
 * 
 *-----------------------------------------------*/
var renderBoard = function()
{
	var width = context.canvas.width;
	var height = context.canvas.height;

	context.clearRect(0, 0, width, height); // Clears the canvas

	context.strokeStyle = "green";
	context.lineJoin = "square";
	context.lineWidth = 1;
	context.beginPath();
	context.rect(board.rect.x, board.rect.y, board.rect.width, board.rect.height);
	context.stroke();
}

/*-----------------------------------------------*
 * Redraw: Calls all the render functions
 *-----------------------------------------------*/
var redraw = function()
{
	renderBoard();
	renderBallTrail();
	renderHitTargets();
	renderLiveTargets();
	renderBall();	
};

/*-----------------------------------------------*
 * Add Current Ball to Trail
 *-----------------------------------------------*/
var addCurrentBallToTrail = function()
{
	var b = {pos:{x:ballInfo.pos.x, y:ballInfo.pos.y}, size:ballInfo.size};
	ballTrail.push(b);
	if (ballTrail.length > ballTrailMaxLen)
		ballTrail.splice(0, 1);
};

var rectIntersectionTest = function(r1, r2)
{
	var result = false;
	
	if (r1.x + r1.width < r2.x)
	{ }
	else if (r2.x + r2.width < r1.x)
	{ }
	else if (r1.y + r1.height < r2.y)
	{ }
	else if (r2.y + r2.height < r1.y)
	{ }
	else
	{
		result = true;
	}
	
	return result;
}

/*-----------------------------------------------*
 * Test Target Hit
 *-----------------------------------------------*/
var testTargetHit = function()
{
	var targetIndex = -1;
	var ballRect = {x:ballInfo.pos.x, y:ballInfo.pos.y, width:ballInfo.size, height:ballInfo.size};
	
	for (var i = 0; i < liveTargetList.length && targetIndex == -1; i++)
	{
		if (rectIntersectionTest(ballRect, liveTargetList[i].rect))
			targetIndex = i;
	}
	
	return targetIndex;
}

var handleHitTarget = function(targetIndex)
{
	var tgt = liveTargetList.splice(targetIndex, 1);
	
	//console.log(JSON.stringify(tgt[0]));
	hitTargetList.push(tgt[0]);
}

/*-----------------------------------------------*
 * Timer Callback
 *-----------------------------------------------*/
var timerCallback = function()
{
	var width = context.canvas.width;
	var height = context.canvas.height;
	
	var left   = board.rect.x;
	var right  = board.rect.x + board.rect.width;
	var top    = board.rect.y;
	var bottom = board.rect.y + board.rect.height;
	
	addCurrentBallToTrail();
	
	/* Advance Ball */
	ballInfo.pos.x += ballInfo.dir.x;
	ballInfo.pos.y += ballInfo.dir.y;
	
	targetHit = testTargetHit();
	
	if (targetHit != -1)
	{
		handleHitTarget(targetHit);
		
		ballInfo.dir.y = -ballInfo.dir.y;
	}
	else
	{
		if (ballInfo.pos.x <= left)
		{
			ballInfo.pos.x = left;
			ballInfo.dir.x = -ballInfo.dir.x;
		}
		else if (ballInfo.pos.x >= right - ballInfo.size)
		{
			ballInfo.pos.x = right - ballInfo.size;
			ballInfo.dir.x = -ballInfo.dir.x;
		}

		if (ballInfo.pos.y <= top)
		{
			ballInfo.pos.y = top;
			ballInfo.dir.y = -ballInfo.dir.y;
		}
		else if (ballInfo.pos.y >= bottom - ballInfo.size)
		{
			ballInfo.pos.y = bottom - ballInfo.size;
			ballInfo.dir.y = -ballInfo.dir.y;
		}
	}
	redraw();
};

/*-----------------------------------------------*
 * 
 *-----------------------------------------------*/
var createBoardLayout = function()
{
	board.rect.x = canvasMargin;
	board.rect.y = canvasMargin;
	board.rect.width = canvas.width - 2 * canvasMargin;
	board.rect.height = canvas.height - 2 * canvasMargin;
}


/*-----------------------------------------------*
 * 
 *-----------------------------------------------*/
function resizeCanvas() {
	canvas.width = window.innerWidth - 20;
	canvas.height = window.innerHeight - 20;
	redraw();
}


/*-----------------------------------------------*
 * Run the code
 *-----------------------------------------------*/
resizeCanvas();
createBoardLayout();
populateTargetList(canvas.width);
redraw();
intervalTimer = setInterval(timerCallback, 10);


