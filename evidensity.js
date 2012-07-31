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
// moving			true or false.  Do we show the moving average of the values in the sparkline?
// pre 				We can display min and max values in the display. If if needs a prefix (like $ for money), include it here as a string.
//
// Uses:			
// The function will also display min, max, first and last values if you include elements with the following naming conventions.
// CANVAS_NAME-min for minimum value
// CANVAS_NAME-max for maximum value
// CANVAS_NAME-last for last value
// CANVAS_NAME-first for first value
//
function drawSparkline(canvas_name, scale_type, min_range, max_range, data, show_moving, pre) {
		
			// Get the canvas element we need
			if (drawingCanvas = document.getElementById(canvas_name) ) {
			
			var vpadding = 4;
			var hpadding = 4;
			
			var cheight = drawingCanvas.height - vpadding;
			var cwidth = drawingCanvas.width - hpadding;
			var chmin = vpadding/2;
			var cwmin = hpadding/2;
			var yscale = 0;
			
			// default scale is min and max values
			var scale = Math.max.apply(Math, data);
			var floor = Math.min.apply(Math, data);
			
			// How should we scale this?
			if (scale_type == "sd") { // standard deviation?
				scale = getAverageFromNumArr(data) + (getStandardDeviation(data, 0)*1);
				floor = getAverageFromNumArr(data) - (getStandardDeviation(data, 0)*1);
			}
			
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
				if (show_moving) {		
					for (i in moving) {
					
						// Calculate the y value of the point for the sparkline	
						yscale = (( (moving[i] - floor) / (scale - floor) ) * cheight) - chmin;
						
						// This spreads the sparkline across the whole canvas and makes sure we don't cut off the ends
						x = ((parseInt(i) + data.length - moving.length) * (cwidth/(data.length)));					
						
						// Upper left is 0,0 on the canvas, so we have to translate it 
						context.lineTo(x, (cheight - yscale));
					}
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
	
	// createMovingAverage	Creates a moving average from the data array and can be of any duration using length
	//
	// Parameters:
	// data		array of values
	// length	length of values to use in the moving average.  (i.e. use every 3 values, 6 values, etc.)
	// 
	// Example:
	// myValues = new Array(1,3,2,1,6,7,8,10);
	// myArray = createMovingAverage(myValues, 3);
	function createMovingAverage(data, length) {
	
		var avg = 0;
		var moving = new Array();
		
		// Loop through the values
		for(i=length-1; i<(data.length-1); i++) {
		
			avg = 0;
			
			// Build our moving average value
			for (j=0; j<length; j++) {
				avg = avg + data[i-j];
			}			
			
			// Add it to our new array
			avg = avg / length;
			moving.push(avg);	
			
		}
		
		return moving;
		
	}
		
	// drawbar 	Simply draw a bar graph
	// 
	// Parameters:
	// canvas_name	id value of the <canvas> tag
	// value		how wide you want it to be as a % of the canvas's width
	// color		hex color value of the bar graph
	//
	// Example:
	// drawBar('barcanvas', 0.75, '#FF0000');
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
	
	// drawStackedBar	Draw a stacked bar graph in one canvas tag using an array of values and an array of colors
	//
	// Parameters:
	// canvas_name		id of the canvas tag
	// values			array of values to draw in the bar graph as a % of the canvas's width
	// color		hex color value of the bar graph
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
						
							// Calculate the width for the bar
							width 				= (drawingCanvas.width-30) * values[i];
							context 			= drawingCanvas.getContext('2d');	
							
							// Set the color			
							context.fillStyle  	= colors[count]; 
							
							context.fillRect(x, 0, x + width, height);		
							x 					= x + width;
							count++;
						}
					}
	}
	
	// drawWinLossBarGraph	Draws vertical bar graph used for win/loss style graphs. They're also useful for showing progres over time.
	//
	// Parameters:
	// canvas_name		id of the canvas tag
	// values			array of values to draw in the bar graph (actual value, not a %)
	// poscolor			hex color value of the bar graph for positive values (green if left blank)
	// negcolo			hex color value of the bar graph for negative values (red if left blank)
	//
	function drawWinLossBarGraph(canvas_name, values, poscolor, negcolor) {
					drawingCanvas = document.getElementById(canvas_name);
										
					// Check the element is in the DOM and the browser supports canvas
					if(drawingCanvas && drawingCanvas.getContext) {	
					
						var height 	= drawingCanvas.height;
						var width 	= drawingCanvas.width;
						var x 		= 0;
						var count 	= 0;
						var xmargin	= 2;
						var ymargin 	= 2;
						var xpad	= 2;
						var color	= "";
						var barheight	= 0;
						var barwidth	= 0;
						var scale 	= Math.max.apply(Math, values);
						var floor 	= Math.min.apply(Math, values);
						var centery	= 0;
						var range 	= 0;
						
						// Not sure if setting these to 0 is the best way, but I think it's the most expected handling of weird values
						if (floor > 0) {
							floor = 0;
						}
						
						if (scale < 0) {
							scale = 0;
						}
						
						// If these colors weren't set, use defaults
						if (poscolor == "") {
							poscolor = "#00FF00";
						}
						
						if (negcolor == "") {
							negcolor = "#FF0000";
						}
						
						// Calculate the width of each bar based on the canvas width and the number of values
						barwidth = width  / (values.length * xpad);
						
						// Start at the first margin
						x = xmargin;
						
						// Find the total range so we can scale the bars
						range = scale - floor;
						centery = height * 0.5;
						
						// Loop through and draw each bar
						for (i in values) {

							// Set color
							color = poscolor;
							
							if (values[i] < 0) {
								color = negcolor;
							}
							
							// Scale bar height
							barheight = ((values[i] / range) * height);
							
							// Draw the bar
							context = drawingCanvas.getContext('2d');				
							context.fillStyle  = color; 
							context.fillRect (x, centery, barwidth, (barheight*(-1)));		
							x = x + barwidth + xpad;
						}
					}
	}
	
	// drawWhiskerSparkline 	Draws a whisker sparkline
	//
	// Parameters:
	// canvas_name		id of the canvas element
	// data				2 dimensional array of values
	// color			array of color values.  Should be equal to the number of lines to draw in the whisker sparkline.
	//					If no colors are passed in, we'll try to come up with our own
	// names			array of names corresponding to each line of values in data and the colors in color
	function drawWhiskerSparkline(table_name, data, color, names) {
	
		// Genrate the HTML we need
		var html 			= "";
		var first 			= true;
		var canvas_name 	= "whisker1";
		var max 			= "";
		var min				= "";
		
		// array of team objects
		var teams			= new Array();
	
		// Array of their last numerical values
		var standings = new Array();
	
		// First loop through and grab the largest and smallest values
		for (var d in data) {
		
			teams[d] = {};
		
			if (first) {
				html += "<tr>" 
					+ "<td id=name-" + d + "></td>" 
					+ "<td rowspan=" + data.length + "><canvas id=whisker1 height=100 width=300></canvas></td>" 
					+ "<td id=standing-" + d + "></td>" 
				+ "</tr>";
				first = false;
			}
			else {
				html += "<tr>" 
					+ "<td id=name-" + d + "></td>" 
					+ "<td id=standing-" + d + "></td>" 
				+ "</tr>";
			}
					
			for (var i in data[d]) {
						
				// Find max value
				if (max < data[d][i]) {
					max = data[d][i];
				}		
							
				// Find min value		
				if (min > data[d][i]) {
					min = data[d][i];
				}
				
				if (data[d][i] !== '') {
					teams[d].standing = data[d][i];
				}
			}
			
			teams[d].name	= names[d];
			teams[d].color	= color[d];
		}
		
		document.getElementById(table_name).innerHTML = html;


		// Get the canvas element we need
		if (drawingCanvas = document.getElementById(canvas_name) ) {
									
			// Check the element is in the DOM and the browser supports canvas
			if(drawingCanvas && drawingCanvas.getContext) {
				
				// Initaliase a 2-dimensional drawing context
				context = drawingCanvas.getContext('2d');
				
				// some values I need to set before drawing

				var height 		= drawingCanvas.height;
				var width 		= drawingCanvas.width;
				var y 			= 0;
				var x			= 0;

				//alert("max:  " + max + ", min:" + min);
				
				// Loop through the data points and plot on the canvas
				for (d in data) {
					//alert(context);
					//context.fillStyle   = '#00f';
					context.strokeStyle = color[d];
					context.lineWidth   = 1;
					context.beginPath();
				
					for (i=0; i<data[d].length; i++) {
				
						if (data[d][i] !== '') {
							// Translate y value to our scale
							y = height - (((data[d][i] - min) / (max - min)) * height);
				
							// This spreads the sparkline across the whole canvas
							x = i * (width/(data[d].length));
										
							// Upper left is 0,0 on the canvas, so we have to translate it 
							context.lineTo(x, y);
						
						}
					}
					
					context.stroke();
				}
					
				teams.sort( 
					function(a, b) { 
						return b.standing - a.standing;
					}
				);
				
				for (i in teams) {
					document.getElementById("standing-" + i).innerHTML 		= teams[i].standing; 
					document.getElementById("name-" 	+ i).innerHTML 		= teams[i].name;
					document.getElementById("standing-" + i).style.color 	= teams[i].color; 
					document.getElementById("name-" 	+ i).style.color 	= teams[i].color;
				}
			
			}
		}
	}
	
	// drawScatterPlot	Draws a scatter plot in an html canvas
	//
	// Parameters:
	// canvas_name		id of the canvas tag
	// xscale			max x value of the scatterplot 
	// yscale			max y value of the scatterplot
	// xdata			array of x axis data (actual data points, not percentages)
	// ydata			array of y axis data (actual data points, not percentages)
	// color			color of the normal data points
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
					
					x = (avg(xdata, 2) / xscale) * cwidth;
					y = cheight - ((avg(ydata, 2) / yscale) * cheight);
					
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

	// formatNumber		Rounds and formats large numbers (over 1000 or 1000000)
	//
	// Parameters:
	// val				The value of the number to display
	// pre				If this needs a prefix (like $) pass it in here
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

	function avg(numArr, numOfDec) {
		if( !isArray( numArr ) ){ return false;	}
		var i = numArr.length, 
			sum = 0;
		while( i-- ){
			sum += numArr[ i ];
		}
		return getNumWithSetDec( (sum / numArr.length ), numOfDec );
	}
	

	// Attribution to @LarryBattle http://bateru.com/news/2011/03/javascript-standard-deviation-variance-average-functions/
	var isArray = function (obj) {
		return Object.prototype.toString.call(obj) === "[object Array]";
	}

	// Series of functions to calculate standard deviations
	
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