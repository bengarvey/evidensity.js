// evidensity.js
// by Ben Garvey
// http://www.bengarvey.com
// Twitter:  @bengarvey
// ben@bengarvey.com

// drawSparkLine	Draws a line graph the size of your canvas.  Intended for tiny canvases to make Tufte style sparklines.
// It automatically y-scales the graph to within one standard deviation of the mean
// Parameters:	
// canvas_name  	The id of the <canvas> tag you want the sparkline to appear in
// min_range 		Lower bound of gray rectangular box (use 0 for no box)
// max_range		Upper bound of gray rectangular box (use 0 for no box)
// data				Array of values to plot
// pre 				We can display min and max values in the display. If if needs a prefix (like $ for money), include it here as a string.
//
// Uses:			
// The function will also display min, max, first and last values if you include elements with the following naming conventions.
// CANVAS_NAME-min for minimum value
// CANVAS_NAME-max for maximum value
// CANVAS_NAME-last for last value
// CANVAS_NAME-first for first value
//
function drawSparkline(canvas_name, min_range, max_range, data, pre) {
		
			// Get the canvas element we need
			if (drawingCanvas = document.getElementById(canvas_name) ) {
			
			var vpadding = 4;
			var hpadding = 4;
			
			var cheight = drawingCanvas.height - vpadding;
			var cwidth = drawingCanvas.width - hpadding;
			var chmin = vpadding/2;
			var cwmin = hpadding/2;
			var yscale = 0;
			
			//var scale = data.max; // Use max value for y scale instead
			var scale = getAverageFromNumArr(data) + (getStandardDeviation(data, 0)*1);
			//var floor = data.min; // Use min value for y scale instead
			var floor = getAverageFromNumArr(data) - (getStandardDeviation(data, 0)*1);
			
			// Reset the floor to zero if it is below.  Will change this later as an option
			if (floor < 0) { 
				floor = 0
			}
			
			var maxy = yscale;
			var maxx = 0;
			var miny = scale;
			var minx = 0;
			
			var moving = new Array();
			var movingAvgLength = 3;
			
			moving = createMovingAverage(data,movingAvgLength);
						
			// Check the element is in the DOM and the browser supports canvas
			if(drawingCanvas && drawingCanvas.getContext) {
		
				// Initaliase a 2-dimensional drawing context
				context = drawingCanvas.getContext('2d');
				
				// Draw the gray normal range boxes
				context.fillStyle = '#DDD';
				context.strokeStyle = '#DDD';
				context.linewidth = 2;
				context.fillRect(cwmin, cheight - (cheight * max_range/scale) + chmin, cwidth, (cheight * (max_range - min_range)/scale));
	
				context.fillStyle   = '#00f';
				context.strokeStyle = '#CAA';
				context.lineWidth   = 1;
				context.beginPath();

				realMin = data[0];
				realMax = 0;
				realFirst = data[0];
				realLast = 0;
 
				// Loop through the data points and plot on the canvas
				for (i in data) {
				
					// Calculate the y value of the point for the sparkline	
					yscale = (( (data[i] - floor) / (scale - floor) ) * cheight) - chmin;
					
					// This spreads the sparkline across the whole canvas and makes sure we don't cut off the ends
					x = (i * (cwidth/(data.length))) + cwmin;
					
					// Upper left is 0,0 on the canvas, so we have to translate it 
					context.lineTo(x, (cheight - yscale));
					
					// Save the edge cases for later
					if (yscale > maxy) {
						maxy = yscale;
						maxx = x;
						realMax = data[i];
					}
					
					if (yscale < miny) {
						miny = yscale;
						minx = x;
						realMin = data[i];
					}
					
					if (i==0) {
						firstx = x;
						firsty = yscale;
					}
					
					if (i==data.length-1) {
						lastx = x;
						lasty = yscale;
						realLast = data[i];
					}
				}
				
				context.stroke();
				
				context.fillStyle   = '#00f';
				context.strokeStyle = '#444';
				context.lineWidth   = 1;
				context.beginPath();
								
				// Draw the moving average
				for (i in moving) {
				
					// Calculate the y value of the point for the sparkline	
					yscale = (( (moving[i] - floor) / (scale - floor) ) * cheight) - chmin;
					
					// This spreads the sparkline across the whole canvas and makes sure we don't cut off the ends
					x = ((parseInt(i) + data.length - moving.length) * (cwidth/(data.length)));					
					
					// Upper left is 0,0 on the canvas, so we have to translate it 
					context.lineTo(x, (cheight - yscale));
				}
				
				context.stroke();
				
				// We should have found our min and max values.  Note them with blue
				context.fillStyle = '#1166FF';
				context.strokeStyle = '#fff';
				context.beginPath();
				context.arc(maxx, (cheight - maxy),1.25,0,Math.PI*2,true);
				context.closePath();
				context.stroke();
				context.fill();
 
				// Add a dot for the lowest data point to the sparkline
				context.fillStyle = '#1166FF';
				context.strokeStyle = '#fff';
				context.beginPath();
				context.arc(minx, (cheight - miny),1.25,0,Math.PI*2,true);
				context.closePath();
				context.stroke();
				context.fill();
				
				// Note the start and ends with red dots
				context.fillStyle = '#FF0000';
				context.strokeStyle = '#fff';
				context.beginPath();
				context.arc(firstx, (cheight - firsty),1.25,0,Math.PI*2,true);
				context.closePath();
				context.stroke();
				context.fill();
 
				// Add a dot for the lowest data point to the sparkline
				context.fillStyle = '#FF0000';
				context.strokeStyle = '#fff';
				context.beginPath();
				context.arc(lastx, (cheight - lasty),1.25,0,Math.PI*2,true);
				context.closePath();
				context.stroke();
				context.fill();

				// If there is a special field for this data, display it
				if (document.getElementById(canvas_name + "-min")) {	
					document.getElementById(canvas_name + "-min").innerHTML 	= formatNumber(realMin, pre);
				}

				if (document.getElementById(canvas_name + "-max")) {
					document.getElementById(canvas_name + "-max").innerHTML 	= formatNumber(realMax, pre);
				}

				if (document.getElementById(canvas_name + "-first")) {
					document.getElementById(canvas_name + "-first").innerHTML 	= formatNumber(realFirst, pre);
				}

				if (document.getElementById(canvas_name + "-last")) {
					document.getElementById(canvas_name + "-last").innerHTML 	= formatNumber(realLast, pre);
				}

			}

		}
	
	}
	
	// Creates a moving average from the data array and can be of any duration using length
	function createMovingAverage(data, length) {
	
		var avg = 0;
		var moving = new Array();
		
		for(i=length-1; i<(data.length-1); i++) {
		
			avg = 0;
			
			for (j=0; j<length; j++) {
				avg = avg + data[i-j];
			}			
			
			avg = avg / length;
			moving.push(avg);	
			
		}
		
		return moving;
		
	}
		
	function drawBar(canvas_name, value, color) {
					drawingCanvas = document.getElementById(canvas_name);
					
					// Check the element is in the DOM and the browser supports canvas
					if(drawingCanvas && drawingCanvas.getContext) {
						// Initaliase a 2-dimensional drawing context
						
						// How wide should the bar be?
						var width = drawingCanvas.width * value;
						var height = drawingCanvas.height;
						context = drawingCanvas.getContext('2d');				
						context.fillStyle   = color; 
						context.fillRect (0, 0, width, height);	
					}
	}
	
	function drawStackedBar(canvas_name, values, colors) {
					drawingCanvas = document.getElementById(canvas_name);
										
					// Check the element is in the DOM and the browser supports canvas
					if(drawingCanvas && drawingCanvas.getContext) {
						// Initaliase a 2-dimensional drawing context
						
						// How wide should the bar be?
						var width = 0;
						var x = 0;
						var count = 0;
						var height = drawingCanvas.height;
						
						for (i in values) {
							width = (drawingCanvas.width-30) * values[i];
							//alert(drawingCanvas.width);
							context = drawingCanvas.getContext('2d');				
							context.fillStyle  = colors[count]; 
							context.fillRect (x, 0, x + width, height);		
							x = x + width;
							count++;
						}
					}
	}
	
// draws a scatter plot in an html canvas
function drawScatterPlot(canvas_name, xscale, yscale, xdata, ydata, color) {

			//alert(canvas_name + ", " + xscale + ", " + yscale + ", " + xdata + ", " + ydata + ", " + color);
		
			// Get the canvas element we need
			if (drawingCanvas = document.getElementById(canvas_name) ) {
				
				var vpadding = 4;
				var hpadding = 4;
				
				var cheight = drawingCanvas.height - vpadding;
				var cwidth = drawingCanvas.width - hpadding;

				if (floor = "") {
					$floor = 0;
				}					
							
				// Check the element is in the DOM and the browser supports canvas
				if(drawingCanvas && drawingCanvas.getContext) {
			
					// Initaliase a 2-dimensional drawing context
					context = drawingCanvas.getContext('2d');					

					var i=0;
					while (i<xdata.length) {						
					
						x = (xdata[i] / xscale) * cwidth;
						y = cheight - ((ydata[i] / yscale) * cheight);
											
						// Add a dot this datapoint
						context.fillStyle = color;
						context.strokeStyle = '#fff';
						context.beginPath();
						context.arc(x, y,1.25,0,Math.PI*2,true);
						context.closePath();
						context.stroke();
						context.fill();	
						
						i = i + 1;
					}
					
					x = (avg(xdata) / xscale) * cwidth;
					y = cheight - ((avg(ydata) / yscale) * cheight);
					
						// Add a dot this datapoint
						context.fillStyle = '#00F';
						context.strokeStyle = '#00F';
						context.beginPath();
						context.arc(x, y,1.25,0,Math.PI*2,true);
						context.closePath();
						context.stroke();
						context.fill();	
					
				}

		}
	
	}	

function formatNumber(val, pre) {

	if (val >= 1000 && val < 1000000) {
		val = pre + (val / 1000).toFixed(0) + "K";
	}
	else if (val >= 1000000) {
		val = pre + (val / 1000000).toFixed(0) + "M";
	}
	else {
		val = pre + val.toFixed(0);
	}

	return val;
}
	
Array.max = function( array ){
	return Math.max.apply( Math, array );
};

Array.min = function( array ){
	return Math.min.apply( Math, array );
};

	// Attribution to @LarryBattle http://bateru.com/news/2011/03/javascript-standard-deviation-variance-average-functions/
	var isArray = function (obj) {
		return Object.prototype.toString.call(obj) === "[object Array]";
	}

	var getNumWithSetDec = function( num, numOfDec ) {	
		var pow10s = Math.pow( 10, numOfDec || 0 );
		return ( numOfDec ) ? Math.round( pow10s * num ) / pow10s : num;
	}
	
	var getAverageFromNumArr = function( numArr, numOfDec ){
		if( !isArray( numArr ) ){ return false;	}
		var i = numArr.length, 
			sum = 0;
		while( i-- ){
			sum += numArr[ i ];
		}
		return getNumWithSetDec( (sum / numArr.length ), numOfDec );
	}
	
	var getVariance = function( numArr, numOfDec ) {
		if( !isArray(numArr) ) { 
			return false; 
		}
		
		var avg = getAverageFromNumArr( numArr, numOfDec ), 
			i = numArr.length,
			v = 0;
	 
		while( i-- ) {
			v += Math.pow( (numArr[ i ] - avg), 2 );
		}
		v /= numArr.length;
		return getNumWithSetDec( v, numOfDec );
	}
	
	var getStandardDeviation = function( numArr, numOfDec ) {
		if( !isArray(numArr) ) { 
			return false; 
		}
		
		var stdDev = Math.sqrt( getVariance( numArr, numOfDec ) );
		return getNumWithSetDec( stdDev, numOfDec );
		
	};