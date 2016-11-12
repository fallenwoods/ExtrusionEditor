
// CurveEditor provides a widget to manipulate a 2d bezier curve. These curves are used as inputs to various dimensions of a 3d geometry
// fixme - there is a lot more to describe here.

// In the Handles is the data model for the curveEditor. I should move the scaleMultiplier and origin there. 
// The view should and controller could be separate entities built around the model
// Question: If i separate these, where do things like undo for model selection go?

function CurveEditor(parentElement,options){

	options = options || {};

	this.CPsToShow = options.CPsToShow !== undefined ? options.CPsToShow : true;
	this.callback = options.callback ;
	this.isClosed = options.isClosed ? options.isClosed : false;	//default is false (or undefined)
	this.handles = options.handles;
	options.range = options.range || [-3,3];	// reasonable default for open editors
	options.size = options.size || 150;
	options.origin = options.origin || [0,0];
	options.scaleMultiplier = options.scaleMultiplier !== undefined ? options.scaleMultiplier : 1;
	options.handleChoice = options.handleChoice || 0;
	this.canvas = new MyCanvas (options.size, options.range);
	
	this.ctrlKey = false;
	this.altKey = false;
	this.focused = false;
	this.historyStack = [];
	this.historyIndex = 0;
	
	this.scaleMultiplier = options.scaleMultiplier || 1;
	this.origin = options.origin || [0,0];

	this.helpfulHandles = [];	
	

	this.helpfulHandles.push(new Handles(this,'line','sharp',2,false));
	this.helpfulHandles.push(new Handles(this,'line','sharp',2,false,{offset:1}));
	this.helpfulHandles.push(new Handles(this,'circle','smooth',4,true));
	this.helpfulHandles.push(new Handles(this,'circle','smooth',4,false));
	this.helpfulHandles.push(new Handles(this,'circle','sharp',6,false));
	this.helpfulHandles.push(new Handles(this,'circle','sharp',4,false));
	this.helpfulHandles.push(new Handles(this,'star','smooth',4,false));
	this.helpfulHandles.push(new Handles(this,'star','smooth',5,true));
	this.helpfulHandles.push(new Handles(this,'star','sharp',5,false));
	this.helpfulHandles.push(new Handles(this,'star','sharp',5,true));
	this.helpfulHandles.push(new Handles(this,'line','sharp',5,true));
	this.helpfulHandles.push(new Handles(this));
	
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'GrannyKnot',curve:new THREE.Curves.GrannyKnot()}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'HeartCurve',curve:new THREE.Curves.HeartCurve(3.5)}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'VivianiCurve',curve:new THREE.Curves.VivianiCurve(10)}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'KnotCurve',curve:new THREE.Curves.KnotCurve()}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'HelixCurve',curve:new THREE.Curves.HelixCurve(),isClosed:false}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'TrefoilKnot',curve:new THREE.Curves.TrefoilKnot()}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'TorusKnot',curve:new THREE.Curves.TorusKnot(20)}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'CinquefoilKnot',curve:new THREE.Curves.CinquefoilKnot(20)}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'TrefoilPolynomialKnot',curve:new THREE.Curves.TrefoilPolynomialKnot(14)}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'FigureEightPolynomialKnot',curve:new THREE.Curves.FigureEightPolynomialKnot()}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'DecoratedTorusKnot4a',curve:new THREE.Curves.DecoratedTorusKnot4a()}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'DecoratedTorusKnot4b',curve:new THREE.Curves.DecoratedTorusKnot4b()}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'DecoratedTorusKnot5a',curve:new THREE.Curves.DecoratedTorusKnot5a()}));
	this.helpfulHandles.push(new Handles(this,'custom','smooth',0,false,{name:'DecoratedTorusKnot5c',curve:new THREE.Curves.DecoratedTorusKnot5c()}));
	
	this.table = d3.select(parentElement||"body").append("table")

	this.svg = this.table.append("svg")
		.attr("width", this.canvas.size)
		.attr("height", this.canvas.size)
		.attr("tabindex", 1);

	this.svg.append("rect")
		.attr("width", this.canvas.size)
		.attr("height", this.canvas.size)
		.on("mousedown", this.mousedown.bind(this));

	this.svg.append("path")
		.datum(this.handles)
		.attr("class", "line")
		.call((this.redraw).bind(this));
		
	//<path data-type="cross"/>
	var crossPts = [[3,0],[0,6],[-3,0],[0,-6]];
	var crossPath ="";
	for(var i = 0; i < crossPts.length; i++){
		crossPath += (i===0?"M":"L")+crossPts[i][0]+","+crossPts[i][1];
	}
	crossPath+= "Z";	//close the figure
	//crossPath="M6,0L-6,0M0,6L0,-6"
	
	this.svg.append("path")
		.attr("class", "origin")
		.attr("d",crossPath)
		.attr("transform","translate("+this.canvas.toCanvas(this.origin)+")")
		.on("mousedown",originDownCallback)
		//.on("mousemove",originMoveCallback)
		.on("mouseup",originUpCallback);

		
	this.table.append("tr").append("input")
		.text("Scale Multiplier")
		.attr("type","range")
		.attr("class","scaleMultiplier")
		.attr("value",this.scaleMultiplier)
		.attr("min",0)
		.attr("max",10)
		//.on("input",scaleMultiplierCallback)
		.on("change",scaleMultiplierCallback)

	var editor = this;
	function scaleMultiplierCallback(){
		editor.addHistory('moveScale',null,editor.scaleMultiplier);
		editor.scaleMultiplier = 1 * this.value;
		editor.redraw();
	}
	function originDownCallback(d){
		editor.addHistory('moveOrigin',null,editor.origin);	// record current location before starting move
		editor.svg.select(".origin").attr("beingDragged",true);
	}
	this.originMoveCallback = function(){
		var node = editor.svg.select(".origin");
		if(!node.attr("beingDragged")) return;
		var pt = d3.mouse(editor.svg.node());
		node.attr("transform","translate("+pt+")");
	}
	function originUpCallback(){
		editor.svg.select(".origin").attr("beingDragged",undefined);	// clear the beingDefined attribute
		var pt = d3.mouse(editor.svg.node());
		editor.origin = editor.canvas.toRange(pt);
		editor.redraw();
	}



	this.table.append("select")
		.on("change", function() { 
		  editor.addHistory('handleChoice',null,editor.table.select(".handleChoice").select("[selected=true]").node().value);
		  editor.handleChoice = editor.helpfulHandles[this.value];
		  editor.redraw(); 
		  })
		.attr("class","handleChoice")
		.selectAll("option")
			.data(this.helpfulHandles)
			.enter().append("option")
			.attr("editor",this)
			.attr("value", function(d,i) { 
				return i; })
			.attr("selected", function(d,i) { 
					if (i === (options.handleChoice || 0)) {

						editor.handleChoice =  editor.helpfulHandles[i];
						return true;
					} else {
						return undefined;
					}
				}.bind(this))
			.text(function(d) {
				return d.name; });
  

	var id = this.svg.node().getBoundingClientRect()
	id = id.top+""+id.left;
	d3.select(window)
		.on("mousemove."+id, this.mousemove.bind(this))
		.on("mouseup."+id, this.mouseup.bind(this))
		.on("keydown."+id, this.keydown.bind(this))
		.on("keyup."+id, this.keyup.bind(this));


	this.dragged = null;

	this.svg.node().focus();
	this.redraw(); 
}
CurveEditor.prototype = {


	 myLine:function() {	
		// For display, the points are scaled to lie within the middle 80% of the drawing area

		if(!this.handleChoice.useHandles) return "M1,1L-1,-1M-1,1L1,-1";
		
		var handles = this.handleChoice.getViewHandles();
		var result = "";
		
		// Move to the first point
		var handle = handles[0].toCanvas();
		result += 'M'+handle.pt[0]+","+handle.pt[1];
		
		// Create the first cubic spline, first cp is the first point
		var handle_0 = handles[0].toCanvas();
		var handle_1 = handles[1].toCanvas();
		result += 'C'+
			(handle_0.pt[0]-handle_0.cpOffset[0])+","+(handle_0.pt[1]-handle_0.cpOffset[1])+","+
			(handle_1.pt[0]+handle_1.cpOffset[0])+","+(handle_1.pt[1]+handle_1.cpOffset[1])+","+
			handle_1.pt[0]+","+handle_1.pt[1];
		
		// add the rest of the cubic splines
		for(var i = 2; i < handles.length;i++){
			var handle_i = handles[i].toCanvas();
			result += 'S'+
				(handle_i.pt[0]+handle_i.cpOffset[0])+","+(handle_i.pt[1]+handle_i.cpOffset[1])+","+
				handle_i.pt[0]+","+handle_i.pt[1];
		}
		if (this.handleChoice.isClosed){
			var handle_0 = handles[0].toCanvas();
			result += 'S'+
				(handle_0.pt[0]+handle_0.cpOffset[0])+","+(handle_0.pt[1]+handle_0.cpOffset[1])+","+
				handle_0.pt[0]+","+handle_0.pt[1];
		}
		return result;
		//return "M192,141.14125114068196L598,56L576,344.10305432229313L768,131.7488413341791";
	},
	redraw:function() {
	  if(!this.handleChoice) return;
	  
	  this.svg.select(".line").attr("d", (this.myLine).bind(this));
	  
	  if(this.handleChoice.useHandles) {
	  
		  // fixme - make handleChoice and handle collection first class objects.
		  this.handles = this.handleChoice.getViewHandles();
		  this.selected = this.selected || {d:this.handles[0],c:'knot'};
		  this.CPsToShow = this.handleChoice.CPsToShow;	  


		  
		  var knots = this.svg.selectAll(".knot")
			  .data(this.handles.slice(0,this.handleChoice.handlesToShow), function(d) { return d.pt });

		  knots.enter().append("circle")		  
				  .attr("r", 1e-6)
				  .on("mousedown", function(d) { 
					d.editor.selected = d.editor.dragged = {d:d,c:'knot'}; 
					d.editor.addHistory('moveKnot',d.editor.dragged,d.editor.dragged.d.pt);
					d.editor.redraw(); 
				   })
				.transition()
				  .duration(1750)
				  .ease("elastic")
				  .attr("r", 6.5)


		  knots
			  .classed("knot", true)
			  .classed("selected", function(d) { return d === d.editor.selected.d && "knot" === d.editor.selected.c; })
			  .attr("cx", function(d) { 
			  d = d.toCanvas(); return d.pt[0]; })
			  .attr("cy", function(d) { 
			  d = d.toCanvas(); return d.pt[1]; });


		  knots.exit().remove();

		  var cp1s = this.svg.selectAll(".cp1")
			  .data(this.handles.slice(0,this.handleChoice.CPsToShow), function(d) { return d.pt });

		  cp1s.enter().append("circle")		  
				  .attr("r", 1e-6)
				  .on("mousedown", function(d) { 
					d.editor.selected = d.editor.dragged = {d:d,c:'cp1'}; 
					d.editor.addHistory('moveCp',d.editor.dragged,d.editor.dragged.d.cpOffset);
					d.editor.redraw();
				   })
				.transition()
				  .duration(1750)
				  .ease("elastic")
				  .attr("r", 3)


		  cp1s
			  .classed("cp1", true)
			  .classed("selected", function(d) { return d === d.editor.selected.d && "cp1" === d.editor.selected.c; })
			  .attr("cx", function(d) { 
			  d = d.toCanvas(); return d.pt[0]+d.cpOffset[0]; })
			  .attr("cy", function(d) { 
			  d = d.toCanvas(); return d.pt[1]+d.cpOffset[1]; });


		  cp1s.exit().remove();
		  
		  var cp2s = this.svg.selectAll(".cp2")
			  .data(this.handles.slice(0,this.handleChoice.CPsToShow), function(d) { return d.pt });

		  cp2s.enter().append("circle")		  
				  .attr("r", 1e-6)
				  .on("mousedown", function(d) { 
					d.editor.selected = d.editor.dragged = {d:d,c:'cp2'}; 
					d.editor.addHistory('moveCp',d.editor.dragged,d.editor.dragged.d.cpOffset);
					d.editor.redraw(); 
				   })
				  //.on("mousemove", function(d,i,n) { 
				  //d.editor.selected = {d:d,c:'cp2'}; d.editor.redraw();})
				.transition()
				  .duration(1750)
				  .ease("elastic")
				  .attr("r", 3)


		  cp2s
			  .classed("cp2", true)
			  .classed("selected", function(d) { return d === d.editor.selected.d && "cp2" === d.editor.selected.c; })
			  .attr("cx", function(d) { 
			  d = d.toCanvas(); return d.pt[0]-d.cpOffset[0]; })
			  .attr("cy", function(d) { 
			  d = d.toCanvas(); return d.pt[1]-d.cpOffset[1]; });


		  cp2s.exit().remove();
	  }
	  
	  
	  if(this.callback) {	
		this.callback(this.handleChoice);
	  }

	  if (d3.event) {
		d3.event.preventDefault();
		d3.event.stopPropagation();
	  }
	},
	mousedown:function() {
	  var pt = this.canvas.toRange(d3.mouse(this.svg.node()));
	  var newHandle = this.handleChoice.addHandleNearPoint(pt);
	  this.selected = this.dragged = {d:newHandle,c:'knot'};
	  this.addHistory('addHandle',this.selected);
	  this.historyStack.push({action:'newHandle'});
	  this.redraw();
	},


	setFocus:function(m){
		//var bb = this.svg[0][0].getBoundingClientRect()
		//if(bb.left <= m[0] && m[0] <= bb.right && bb.top <= m[1] && m[1] <= bb.bottom){
		var size = this.canvas.size;
		if(0 <= m[0] && m[0] <= size && 0 <=m[1] &&  m[1] <= size){
			this.focused = true;
		}else{
			this.focused = false;
			this.dragged = null;
		}
	},
	
	mousemove:function() {
	  var m = d3.mouse(this.svg.node());
	  this.setFocus(m)
	  if(this.svg.select(".origin").attr("beingDragged")) this.originMoveCallback();
	  if (!this.dragged || !this.focused) return;
	  
	  switch (this.dragged.c){
		case 'knot':
			this.dragged.d.movePtCanvas(m);
		  break;
		case 'cp1':
			this.dragged.d.moveCp1Canvas(m);
		  break;
		case 'cp2':
			this.dragged.d.moveCp2Canvas(m);
		  break;  
	  }
	  this.redraw();
	},

	mouseup:function() {
	  if (!this.dragged) return;
	  this.mousemove();
	  this.dragged = null;
	},

	keydown:function() {
	console.log("keycode:"+d3.event.keyCode);
	  if (!this.focused ) return; // Need to use focused here since all editors will get this event.
	  switch (d3.event.keyCode) {
		case 8: // backspace
		case 46: { // delete
		  if(!this.selected || this.selected.c != 'knot' ) return;
		  this.addHistory('deleteHandle',this.selected,this.handles.indexOf(this.selected.d));
		  this.selected = this.handleChoice.removeSelectedHandle(this.selected.d);  
		  this.redraw();
		  break;
		}
		case 17:	// Control
			this.ctrlKey = true;
		break;
		case 18:	// Alt
			this.altKey = true
		break;
		case 90:	//Z
			if(this.ctrlKey) this.undo();
			if(this.altKey) 
				this.undoAll();
		break;
	  }
	},
	keyup:function() {
	  if (!this.focused || !this.selected || this.selected.c != 'knot' ) return;	// Need to use focused here since all editors will get this event.
	  switch (d3.event.keyCode) {
		case 17:	// Control
			this.ctrlKey = false;
		break;
		case 18:	// Alt
			this.altKey = false;
		break;
		case 90:	//Z
		break;
	  }
	},
	addHistory:function(action,item,savedState){
		if(this.historyStack.length > this.historyIndex) this.historyStack = this.historyStack.slice(0,this.historyIndex);	// old redo is now gone
		savedState = (savedState && savedState.clone) ? savedState.clone() : savedState instanceof Array ? savedState.slice(0) : savedState;	// fixme - assume array contains only simple types
		this.historyStack.push({action:action,item:item,state:savedState});
		this.historyIndex++;
	},
	undo:function(){
		if(this.historyIndex === 0 ) return;		// stack is empty
		this.historyIndex -= 1;
		var item = this.historyStack[this.historyIndex];
		switch(item.action){		// rather than implement undo in each action
			case 'initialState':	//TBD for undoAll if that turns out to be a better approach
			break;
			case 'moveKnot':
				item.item.d.pt = item.state;
				this.selected = item.item;
				this.dragged = null;
				//this.selected = this.dragged = item.item;
				//this.dragged.d.movePtCanvas(m);
			break;
			case 'moveCp':
				item.item.d.cpOffset = item.state;
				this.selected = item.item;
				this.dragged = null;
				//this.selected = this.dragged = item.item;
				//this.dragged.d.moveCp1Canvas(m);
			break;
			case 'deleteHandle':
				this.handleChoice.unremoveHandle(item.item,item.state);
			break;
			case 'addHandle':
				this.selected = this.handleChoice.removeSelectedHandle(item.item.d); 
			break;
			case 'moveOrigin':
				this.origin = item.state;
				var pt = this.canvas.toCanvas(this.origin);
				 this.svg.select(".origin").attr("transform","translate("+pt+")");
			break;
			case 'moveScale':
				this.scaleMultiplier = item.state;
				this.table.select(".scaleMultiplier").node().value=this.scaleMultiplier;
			break;
			case 'handleChoice':
			// TJM fixme - need and implementation
				this.handleChoice = this.helpfulHandles[item.state];
				this.table.select(".handleChoice").node().value=item.state;
			break;
		}
		
		this.redraw();		
	},
	redo:function(){
		if(this.historyIndex === this.historyStack.length ) return;		// nothing more to redo.
		var item = this.historyStack[this.historyIndex];
		this.historyIndex += 1;
		switch(item.action){		// rather than implement redo in each action
		}
	},
	undoAll:function(){
		// cheap implementation, we'll literally just undo each item one by one
		for(var i = this.historyIndex; i > 0; i--)
			this.undo();
	},

}

/*
	shape:line,circle,star
	smoothness: sharp, smooth
	nodes: 2->~20
	joined:true, false
*/


function Handles(editor,shape,smoothness,reflections,joined,options){
	
	this.editor = editor;
	this.joined = joined || false;
	this.shape = shape || 'line'
	this.smoothness = smoothness || 'smooth';
	this.reflections = (reflections === undefined || reflections < 2) ? 2 : reflections;
	this.isClosed = true;
	this.options = options || {}
	this.swirlInc = this.options.swirl || 0;		//fixme - swirl is a good idea - makes radius go from 1 to scaleMultiplier rather than const scaleMultiplier
	this.curve = this.options.curve;
	//this.zInc = options.zInc || 0;		// fixme - this one isn't as clear, we might want something more general here. 
	
	this.name = this.smoothness+'-'+this.shape+'-'+this.reflections+(this.joined?'-joined':'');
	this.name  = this.options.name || this.name;
	
	this.baseHandles = [];
	this.viewHandles;
	this.useHandles = true;
	
	var cp;
	switch(this.shape){
		case 'line':
			cp =  [0,0.1];
			this.reflections = 2;
			this.handlesToShow = this.joined ? 1 : this.reflections
			this.isClosed = false;
		break;
		case 'circle':
			cp = [(4/3)*Math.tan(Math.PI/(2*this.reflections)),0];
			this.handlesToShow = this.joined ? 1 : this.reflections
		break;
		case 'star':
			cp =  [0.2,0]
			this.handlesToShow = this.joined ? 2 : 2 * this.reflections
		break;
		case 'custom':
			this.handlesToShow = 0;
			this.reflections = 1;
			this.isClosed = this.options.isClosed || true;
			this.useHandles = false;
		break;
	}
	
	this.CPsToShow = (this.smoothness === 'smooth') ? this.handlesToShow : 0;		// show cp for pts that have handles?
	
	cp = this.smoothness !== 'smooth' ? [0,0] : cp;
	
	if(this.useHandles){
		var handle = new Handle(this.editor,[0,1],cp);
		this.baseHandles.push(handle);
		if(this.shape === 'star') {
			handle = new Handle(this.editor,[0,0.5],cp).rotate(-(2 * Math.PI) / (2 * this.reflections));
			this.baseHandles.push(handle);
		}
	}


}
Handles.prototype = {
	getViewHandles:function(){
		var result = (this.viewHandles === undefined || this.joined) ? (this.viewHandles = this.reflectHandles()) : this.viewHandles;
		return result;
	},
	getObjectHandles:function(){

	
		var tmp = this.getViewHandles();
		result = [];
		for(var i = 0 ; i < tmp.length;i++) {
			result.push(tmp[i].transform(this.editor.scaleMultiplier,[-this.editor.origin[0],-this.editor.origin[1]]));
		}
		return result;
	},
	
	reflectHandles:function(){			// used internally
		var result = [];

		for (var j = 0; j < this.baseHandles.length; j++){	// use the actual baseHandles for '0' rotation so they will move etc
			this.baseHandles[j].index = j;
			result.push(this.baseHandles[j]);
		}
		for ( var i = this.reflections-1 ; i >= 1; i-- ) {

			var a = (i  * 2 * Math.PI) / this.reflections;
			
			for (var j = 0; j < this.baseHandles.length; j++){
				var h = this.baseHandles[j];
				var newHandle = h.rotate(a);
				newHandle.index = i*this.baseHandles.length + j;
				result.push(newHandle);
			}
		}
		return result;
		
	},
	addHandleNearPoint:function(pt){
	  var dMin=Number.MAX_VALUE, index, next;
	  var handles = this.joined ? this.baseHandles : this.viewHandles;
	  if (handles === undefined) return;
	  
	  for (var i = 0; i < handles.length; i++){
		  var dist;
		  if( (dist = distance(pt,handles[i].pt)) < dMin){
			  dMin = dist;
			  index = i;
		  }
	  }

	  next = (index+1)%handles.length;								// next handle with wrap for closed shapes
	  // if the selected point is between the matched one and the next, if follows the matched one, otherwise it preceeds it.
	  if (distance (pt,handles[next].pt) <
			distance (handles[index].pt,handles[next].pt)){
				if ( this.isClosed || index !== handles.length-1)	// move to the next unless this is the last point on an open curve
					index = next;
		 }
	  var newHandle = new Handle(this.editor,pt,handles[index].cpOffset);
	  handles.splice(index, 0, newHandle);
	  
	  this.CPsToShow = this.CPsToShow > 0 ? this.CPsToShow + 1 : 0;
	  this.handlesToShow += 1;
	  
	  return newHandle;
	},
	removeSelectedHandle:function(selected){
		var handles = this.joined ? this.baseHandles : this.viewHandles;
		if(handles.length == 1 || (handles.length == 2 && !this.joined)) return selected;	
		
		var i = handles.indexOf(selected);
		handles.splice(i, 1);
		var result = handles.length ? {d:handles[i > 0 ? i - 1 : 0],c:'knot'} : null;
		
		this.CPsToShow = this.CPsToShow > 0 ? this.CPsToShow - 1 : 0;
		this.handlesToShow = this.handlesToShow > 0 ? this.handlesToShow -1 : 0;
	  
		return result;
	},
	unremoveHandle:function(handle,index){
		var handles = this.joined ? this.baseHandles : this.viewHandles;
		handles.splice(index, 0, handle.d);
		this.selected = this.dragged = handle;
		this.handlesToShow = this.handlesToShow > 0 ? this.handlesToShow + 1 : this.HandlesToShow;
		this.CPsToShow = this.CPsToShow > 0 ? this.CPsToShow + 1 : 0;
	}
				

}
// One Handle in Handles
// Handles are used to set the parameters of the CubicSplines used for curves. Each handle has a point and a control point. The curve will go through
// the point and curve outward in the direction of the control point. If two curves meet at the handle (which is typical) the control point is used to 
// influence the start of the curve leaving, the relection around the point is used to influance the incoming curve.
// The point is generally approximately of unit size. The control points are specified as offsets from the point.
function Handle(editor, pt, cpOffset){
	this.editor = editor;
	this.pt = pt;
	this.cpOffset = cpOffset || [0,-0.2];//0.551915];
}
Handle.prototype = {
	// scale the point to the canvas coordinate system. 
	movePtCanvas:function(pt){
		var size = this.editor.canvas.size;
		pt = [Math.max(0, Math.min(size, pt[0])),Math.max(0, Math.min(size, pt[1]))]
		this.pt  = this.editor.canvas.toRange(pt);
	},
	// scale the control point to the canvas coordinate system. 
	moveCp1Canvas:function(pt){
		var size = this.editor.canvas.size;
		pt = [Math.max(0, Math.min(size, pt[0])),Math.max(0, Math.min(size, pt[1]))]
		var offset = this.editor.canvas.toRange(pt);
		this.cpOffset = [offset[0]-this.pt[0],offset[1]-this.pt[1]];
	},
	// scale the control point reflection to the canvas coordinate system. This is a convenience function
	moveCp2Canvas:function(pt){
		var size = this.editor.canvas.size;
		pt = [Math.max(0, Math.min(size, pt[0])),Math.max(0, Math.min(size, pt[1]))]
		var offset = this.editor.canvas.toRange(pt);
		this.cpOffset = [this.pt[0]-offset[0],this.pt[1]-offset[1]];
	},
	// This applies the canvas transform to the entire Handle.
	toCanvas:function(){
		var offset = this.editor.canvas.toCanvas([this.cpOffset[0]+this.pt[0],this.cpOffset[1]+this.pt[1]]);
		var pt = this.editor.canvas.toCanvas(this.pt);
		return {
			pt:pt,
			cpOffset:[offset[0]-pt[0],offset[1]-pt[1]]
		};
	},
	// Rotate the coordinates of the handle in the plane by the angle (in radians)
	rotate:function(angle){
	return new Handle (this.editor,
		[
		  Math.cos(angle)*this.pt[0] + Math.sin(angle)*this.pt[1],
		 -Math.sin(angle)*this.pt[0] + Math.cos(angle)*this.pt[1]
		],
		[
		  Math.cos(angle)*this.cpOffset[0] + Math.sin(angle)*this.cpOffset[1],
		 -Math.sin(angle)*this.cpOffset[0] + Math.cos(angle)*this.cpOffset[1]
		]);
	},
	// Translate and scale the coordinates. 
	transform:function(mult,offset) {
		return new Handle (this.editor,
			[
				(this.pt[0] + offset[0]) * mult,
				(this.pt[1] + offset[1]) * mult
			],
			[
				this.cpOffset[0] * mult,
				this.cpOffset[1] * mult
			]);
	}
}

// The canvsa provides a mapping from a range (typically in the 0-1 range) to the dimensions of the region in the browser
function MyCanvas(size, range){
	this.size = size || 200
	this.domainStart = this.size;
	this.domainEnd = 0;
	this.domainSize = this.domainEnd-this.domainStart;
	this.rangeStart = range ? range[0] : 0;
	this.rangeEnd = range ? range[1] : 2;
	this.rangeSize = this.rangeEnd-this.rangeStart;
}
MyCanvas.prototype = {
	toCanvas:function(pt){
		var newPt = [
			(pt[0]-this.rangeStart)/this.rangeSize*this.domainSize+this.domainStart,
			(pt[1]-this.rangeStart)/this.rangeSize*this.domainSize+this.domainStart
		];
		return newPt;
	},
	toRange:function(pt){
		var newPt = [
			(pt[0]-this.domainStart)/this.domainSize*this.rangeSize+this.rangeStart,
			(pt[1]-this.domainStart)/this.domainSize*this.rangeSize+this.rangeStart
			];
		return newPt;
	}
	
}
// Utility
function distance (pt1,pt2){
	return Math.sqrt((pt1[0]-pt2[0])*(pt1[0]-pt2[0]) + (pt1[1]-pt2[1])*(pt1[1]-pt2[1]))
}