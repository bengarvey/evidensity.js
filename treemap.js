// treemap.js
// by Ben Garvey
// http://www.bengarvey.com
// Twitter:  @bengarvey
// ben@bengarvey.com
//
// Hosted at https://github.com/bengarvey/evidensity.js/
// License:  https://github.com/bengarvey/evidensity.js/blob/master/mit-license.txt


  // Treemap class
  function Treemap () {
  
      

  }

  // Each data group on the treemap is assigned a branch.  Branches are also collections of sub branches
  function Branch() {

    // data for how the branch looks
    this.value = 0;
    this.color = 0;
    this.label = 0;
    
    // Link to parent node in the tree
    this.parent   = 0;

    // Collection of child nodes
    this.children = new Array();

    // Current x and y values in the current view
    this.x        = 0;
    this.y        = 0;
  }

	
	// drawTreeMap	Draws a Treemap on an HTML5 canvas
	//
	// Parameters:
	// canvas_name		id of the canvas tag
	// data				array of values to be mapped
	// colors			array of colors to use that corresponds with values in data
	function drawTreeMap(canvas_name, data, colors, labels) {
	
		// Get the canvas element we need
		if (drawingCanvas = document.getElementById(canvas_name) ) {
									
			// Check the element is in the DOM and the browser supports canvas
			if(drawingCanvas && drawingCanvas.getContext) {
			
						drawingCanvas.addEventListener("mouseover", 
     						function(e) {	
	     						// Capture x and y
	     						//var clickx = e.clientX - drawingCanvas.offsetLeft;
	     						//var clicky = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;	
	     						var clickx = e.pageX - drawingCanvas.offsetLeft;
	     						var clicky = e.pageY - drawingCanvas.offsetTop;
	     						
		     					// We've clicked.  		
		     					//alert("mouseover:  " + clickx + ", " + clicky);
		     					
								// Check coordinates to see what box we clicked in
								for(b in drawingCanvas.boxArray) {
									box = drawingCanvas.boxArray[b];
									if (clickx > box.x && clickx < (box.x + box.w) && clicky > box.y && clicky < (box.y + box.h) ) {
										
										// We found it!  
										//alert(box.label);
										
										var infodiv = {};
										var sheet = {};
										
										// Check to see if we have an info div 
										if (document.getElementById('treemap-info-div') == null) {
											infodiv = document.createElement('div');
											infodiv.setAttribute('id', 'treemap-info-div');
											
											//alert(infodiv.id);
																						
											sheet = document.createElement('style');
											sheet.innerHTML = "#treemap-info-div {	border: 1px solid #555555; 	\
																					font: Arial;				\
																					color:  #555555;			\
																					font-size: 10pt;			\
																					position:  absolute;		\
																					z-index: 100;				\
																					top:	50px;				\
																					left: 50px;					\
																				}";
											document.body.appendChild(sheet);
											document.body.appendChild(infodiv);
											
											
											//document.body.appendChild(infodiv);

											
										}
										else {
											infodiv = document.getElementById('treemap-info-div');
										}
										
										infodiv = document.getElementById('treemap-info-div');
										
										infodiv.innerHTML = box.label;
										
										//alert(infodiv.style.top);

										// Move info div into position
										//infodiv.style.setAttribute('left', box.x + box.w + 10);
										//infodiv.style.setAttribute('top', box.y);
										
										$('#treemap-info-div').css('top', box.x + box.w + 10);
										$('#treemap-info-div').css('left', box.y);
										$('#treemap-info-div').css('visibility', 'visible');
										
										// Show info div
										//infodiv.stylesetAttribute('visibility', 'visible');
										
										//alert(infodiv.style.top);
										
									}
								}
								
	     					}
						);
			
						drawingCanvas.addEventListener("click", 
     						function(e) {	
	     						// Capture x and y
	     						//var clickx = e.clientX - drawingCanvas.offsetLeft;
	     						//var clicky = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;	
	     						var clickx = e.pageX - drawingCanvas.offsetLeft;
	     						var clicky = e.pageY - drawingCanvas.offsetTop;
	     						
		     					// We've clicked.  		
		     					//alert("clicked:  " + clickx + ", " + clicky);
		     					
								// Test box values
								//for(d in drawingCanvas.boxArray) {
								//	alert(drawingCanvas.boxArray[d].x);
								//}
								
								// Check coordinates to see what box we clicked in
								for(b in drawingCanvas.boxArray) {
									box = drawingCanvas.boxArray[b];
									if (clickx > box.x && clickx < (box.x + box.w) && clicky > box.y && clicky < (box.y + box.h) ) {
										
										// We found it!  
										alert(box.label);
									}
								}
	     					}
						);
				
				// Initaliase a 2-dimensional drawing context
				context = drawingCanvas.getContext('2d');
				drawingCanvas.resizing = false;
	
				boxes = new Array();
				var colorcount = 0;
			
				// First create the box objects
				for(d in data) {
				
					// Loop back around if we don't pass in a color for every value
					if (colorcount >= colors.length) {
						colorcount = 0;
					}
				
					// initialize the box object
					boxes[d] 			= {};
					
					// The main data point, the size of the box to draw
					boxes[d].size 		= data[d];
					
					// Set color if none were passed in
					if (colors.length == 0) {
						boxes[d].color 		= randomColor();
					}
					else {
						boxes[d].color 		= colors[colorcount];
					}
					
					// The text to display over the box
					boxes[d].label		= labels[d];
					
					// increment our color counter
					colorcount++;
					
				}
				
				// We need to save the array of boxes and retrieve it later, so use the canvas
				drawingCanvas.boxArray = new Array();
				
				// This seems wrong, but I had issues setting the array as a whole.  It worked fine setting each element individually
				for(d in boxes) {
					drawingCanvas.boxArray[d] = boxes[d];
				}
				
				// Sort them largest to smallest, so the treemap gets drawn nicely
				boxes.sort( 
					function(a, b) { 
						return b.size - a.size;
					}
				);
		
				// Grabbing the div height
				var height 		= drawingCanvas.height;
				var width 		= drawingCanvas.width;
				
				// Render the boxes.  renderBox is a recursive function that calls itself to draw all the boxes
				renderBox(canvas_name, context, boxes, 0, 0, 28, width, height);		
			}
		}
		
	}
	
	// renderBox 		Renders a treemap and recursively calls itself to fill in the rest of the map
	//
	// Parameters:
	// context			drawing context
	// boxes			array of box objects to be rendered
	// x				starting x value of the drawing context
	// y				starting y value of the drawing context
	// scale			scale for values
	//
	// Returns:			array of objects still to be rendered
	function renderBox(canvas_name, context, boxes, x, y, scale, width, height) {
	
		// If we pass in an empty array, we're done.
		if (boxes.length > 0) {
	
			// Shift this box out of the array.  If we end up not rendering it, we'll have to put it back in
			var box 	= boxes.shift();
			var skipped = false;

			// Width and height of the box. We try to draw a square, but might adjust it depending on how much room we have
			var w   	= (Math.sqrt(box.size) / scale);
			var h 		= w;
			var temp 	= 0;
			
			// Check to see if there's just a little bit left in the box below.  If so, just use it.
			if (( (height - y - h) / height) < 0.1 && height > y) {
				temp = w * h;
				h = height-y;
				w = temp / h;
				
			}
			else if (( (width - x - w) / width) < 0.15 && width > x) {
				temp = w * h;
				w = width-x;
				h = temp / w;
				
			}

			// If I draw this box as a square, will I exceed the boundary?
			if (w > (width-x) || h > (height-y)) {
			
				// Resize it to fit
				tempa = w * h;
				w = width - x;
				h = tempa / w;
					
				// Does the height now exceed the boundary?
				if (y + h > height) {
						
					// We've reached the end of our room.  Unshift this one and see if we can draw a different one
					skipped = true;

				}

			}
			
			// if our height and width ratios are too crazy, skip drawing this box here even though it technically fits
			if (w/h > 20 || h/w > 10) {
				skipped = true;
			}
			
			// If we're skipping, send the next box the same dimensions we received.
			if (skipped) {
				w = 0;
				h = 0;
				
			}
			else {
		
				// Draw the box
				context.fillStyle 	= box.color;
				context.strokeStyle = '#FFFFFF';
				context.linewidth 	= 2;
				
				// If you have a div called treemapdata it will post some of the data.  Useful for debugging
				if (document.getElementById('treemapdata') != null) {
					document.getElementById('treemapdata').innerHTML += box.label + " height " + Math.round(y) + " " + Math.round(h) + " " + Math.round(height) + "<br>";
					document.getElementById('treemapdata').innerHTML += box.label + " width " + Math.round(x) + " " + Math.round(w) + " " + Math.round(width) + "<br>";
				}
				
				// Draw a rounded box
				roundRect(context, x, y, w, h-2, 7, true, true);
				
				// Save the coordinates in the box object
				box.x = x;
				box.y = y;
				box.w = w;
				box.h = h;
				
				// Draw the label
				context.font = "12pt Helvetica";
				context.fillStyle = "white";
				var label = box.label;
				
				// Shrink the label string until it fits.
				while(context.measureText(label).width > w-4 && label.length > 0) {
					label = label.substr(0,label.length-1);
									//alert(context.measureText(box.label).width + " vs " + (w-10) + " " + label.length);
				}
				
				// Only show labels for ones where it will fit horizontally, too
				if (h > 15) {
					context.fillText(label, x+4, y+17, w);
				}
			
			}
			
			// We need separate height values for each recursive call
			var nextheight = y + h;
			
			if (skipped) {
				nextheight = height;
			}
		
			// Render boxes to the right now that we've removed one value
			boxes = renderBox(canvas_name, context, boxes, x + w, y, scale, width, nextheight);
				
			// If we skipped this because it didn't fit, put it back before sending the array down below
			if (skipped) {
				boxes.unshift(box);
			}
			else {
			
				// Only check below if there is room left
				if (y+h < height) {
					// Render boxes to the bottom minus any we've already rendered
					boxes = renderBox(canvas_name, context, boxes, x, y + h, scale, width, height);
				}
			}
		}
		
		return boxes;
	}
