

// Extend the THREE.Curve and THREE.CurvePath objects to add translation,scaling and rotation
//fexme - make these not be enumerable
THREE.CurvePath.prototype.translate = function(x,y,z){ 
	for(var i = 0; i< this.curves.length;i++){
		this.curves[i].applyFlatTransform(0,1,x,y,z);
	}
}
THREE.CurvePath.prototype.rotate = function(angle){ 
	for(var i = 0; i< this.curves.length;i++){
		this.curves[i].applyFlatTransform(angle,1,0,0,0);
	}
}
THREE.CurvePath.prototype.scale = function(scale){ 
	for(var i = 0; i< this.curves.length;i++){
		this.curves[i].applyFlatTransform(0,scale,0,0,0);
	}
}
THREE.CurvePath.prototype.r2tor3 = function (){
	var curves=[];
	var holes = [];
	var result = new THREE.Path();
	for(var i = 0; i< this.curves.length;i++){
		curves.push(this.curves[i].r2tor3());
	}
	for(var i = 0; i< this.holes.length;i++){
		holes.push(this.holes[i].r2tor3());
	}
	result.curves = curves;
	result.holes = holes;
	result.autoClose = this.autoClose;
	result.currentPoint = this.currentPoint.r2tor3();
	return result;
}

THREE.Vector3.prototype.applyFlatTransform = function (rotationZ,scale,x,y,z){
	this.x = (this.x * Math.cos(rotationZ) + this.y * -Math.sin(rotationZ)) * scale + x;	// rotate, scale and then translate
	this.y = (this.x * Math.sin(rotationZ) + this.y * Math.cos(rotationZ)) * scale + y;	// rotate, scale and then translate	
	//this.z is unchanged
}
THREE.Vector2.prototype.applyFlatTransform = function (rotationZ,scale,x,y,z){
	this.x = (this.x * Math.cos(rotationZ) + this.y * -Math.sin(rotationZ)) * scale + x;	// rotate, scale and then translate
	this.y = (this.x * Math.sin(rotationZ) + this.y * Math.cos(rotationZ)) * scale + y;	// rotate, scale and then translate	
	//this.z is unchanged
}
THREE.Vector2.prototype.r2tor3 = function (){
	return new THREE.Vector3(this.x,this.y,0);
}
THREE.Vector3.prototype.r2tor3 = function (){
	return this;
}



THREE.SplineCurve3.prototype.applyFlatTransform = function (rotationZ,scale,x,y,z){
	for (var i=0;i<this.points.length;i++){this.points[i].applyFlatTransform (rotationZ,scale,x,y,z)}
}

THREE.SplineCurve.prototype.r2tor3 = function (){
	var newPoints=[]
	for (var i=0;i<this.points.length;i++){newPoints.push(points[i].r2tor3());}
	return new THREE.SplineCurve3(points);
}

THREE.LineCurve3.prototype.applyFlatTransform = function (rotationZ,scale,x,y,z){
	this.v1.applyFlatTransform(rotationZ,scale,x,y,z);
	this.v2.applyFlatTransform(rotationZ,scale,x,y,z);
}
THREE.LineCurve.prototype.r2tor3 = function (){
	return new THREE.LineCurve3 (this.v1.r2tor3(),this.v2.r2tor3());
}
THREE.QuadraticBezierCurve3.prototype.applyFlatTransform = function (rotationZ,scale,x,y,z){
	this.v0.applyFlatTransform(rotationZ,scale,x,y,z);
	this.v1.applyFlatTransform(rotationZ,scale,x,y,z);
	this.v2.applyFlatTransform(rotationZ,scale,x,y,z);
}
THREE.QuadraticBezierCurve.prototype.r2tor3 = function (){
	return new THREE.QuadraticBezierCurve3(this.v0.r2tor3(),this.v1.r2tor3(),this.v2.r2tor3());
}
THREE.CubicBezierCurve3.prototype.applyFlatTransform = function (rotationZ,scale,x,y,z){
	this.v0.applyFlatTransform(rotationZ,scale,x,y,z);
	this.v1.applyFlatTransform(rotationZ,scale,x,y,z);
	this.v2.applyFlatTransform(rotationZ,scale,x,y,z);
	this.v3.applyFlatTransform(rotationZ,scale,x,y,z);
}
THREE.CubicBezierCurve.prototype.applyFlatTransform = function (rotationZ,scale,x,y,z){
	this.v0.applyFlatTransform(rotationZ,scale,x,y,z);
	this.v1.applyFlatTransform(rotationZ,scale,x,y,z);
	this.v2.applyFlatTransform(rotationZ,scale,x,y,z);
	this.v3.applyFlatTransform(rotationZ,scale,x,y,z);
}
THREE.CubicBezierCurve.prototype.r2tor3 = function (){
	return new THREE.CubicBezierCurve3(this.v0.r2tor3(),this.v1.r2tor3(),this.v2.r2tor3(),this.v3.r2tor3());
}
THREE.EllipseCurve.prototype.r2tor3 = function (){
	return new EllipseCurve3(this.aX, this.aY, this.xRadius, this.yRadius, this.aStartAngle, this.aEndAngle, this.aClockwise, this.aRotation);
}

// Create a 3d ellipse curve for arcs, circles and ellipses
function EllipseCurve3( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation ) {

	this.aX = aX;
	this.aY = aY;

	this.xRadius = xRadius;
	this.yRadius = yRadius;

	this.aStartAngle = aStartAngle;
	this.aEndAngle = aEndAngle;

	this.aClockwise = aClockwise;

	this.aRotation = aRotation || 0;

}

EllipseCurve3.prototype = Object.create( THREE.EllipseCurve.prototype );
EllipseCurve3.prototype.constructor = EllipseCurve3;

EllipseCurve3.prototype.getPoint2 = EllipseCurve3.prototype.getPoint;
EllipseCurve3.prototype.getPoint = function( t ) { return this.getPoint2(t).r2tor3();}
EllipseCurve3.prototype.applyFlatTransform = function (rotationZ,scale,x,y,z){
	this.aEndAngle += rotationZ;
	this.aRotation += rotationZ;
	this.aStartAngle += rotationZ;
	var tmp = new Vector2(this.aX,this.aY).applyFlatTransform(rotationZ,scale,x,y,z);
	this.aX = tmp.x;
	this.aY = tmp.y;
	this.xRadius *= scale;
	this.yRadius *= scale;
}

/*
crossSection:
	crossSection must be a shape (2D) object. It should be specified in counterclockwise order
Options:
	transformer: provides a Matrix4 for each extrudeStep (input is 0-1), defaults to followerTransformer which follow extrusionPath3, with the origin of the crossSection on the curve, with up(z) on the curve tangent and x on the curve normal
	extrudeSteps: Number of steps to take along extrusionPath3. Default is 20
	shapeSteps: The number of steps to take around the perimeter of crossSection. Default is 12
	closeCrossSection: Connects the last path on the crossSection to the first. Default is true
	closeExtrusion: Connects the last curve of extrusionPath3 to the first. Default is false.
	capExtrusion: If closeExtrusion is false, this will determine if a top and bottom are added to the extrusion . Default is true.
	
TransformerOptions: provides inputs to your transformer. The values below are for the FollowerTransformer
	extrusionPath3: A curve in 3 space. Must inherit from THREE.Curve. Default is a LineCurve3 from the origin to z=10
	rotation: A rotation applied to the crossSection by the follower transformer at each extrudeStep. Default is function(v){return 0}
	scaling: A scaling applied to the crossSection by the follower transformer at each extrudeStep. Z is ignored. Default is function(v){return THREE.Vector3(1,1,1};}

*/

function CompositeExtrudeGeometry (crossSection, options, transformerOptions) {
	this.options = options || {}

	// Collect options and set defaults
	this.options.closeExtrusion = this.options.closeExtrusion !== undefined ? this.options.closeExtrusion : false;
	transformerOptions.closeExtrusion = options.closeExtrusion;
	this.options.transformer = this.options.transformer !== undefined ? this.options.transformer : new followerTransformer(this.options.extrudeSteps,transformerOptions);
	this.options.extrudeSteps = this.options.extrudeSteps !== undefined ? this.options.extrudeSteps : 20;
	this.options.shapeSteps = this.options.shapeSteps !== undefined ? this.options.shapeSteps : 12;
	this.options.closeCrossSection = this.options.closeCrossSection !== undefined ? this.options.closeCrossSection : true;
	this.options.capExtrusion = this.options.capExtrusion !== undefined ? this.options.capExtrusion : true;

	var transformer = this.options.transformer; 
	crossSection.autoClose = this.options.closeCrossSection;
	
	// Get the points along the cross section curve 
	var crossSectionGeo = crossSection.createPointsGeometry(this.options.shapeSteps);
	var geos=[]; 


	// The transformer has interpolated the extrusion path as part of it's constructor (called above)
	// Apply the matrix derived from the followers interpolation to the cross section repeatedly to create a 'stack' of cross sections
	for(var i = 0; i<= this.options.extrudeSteps;i++){
		var matrix = transformer.getTransform(i/this.options.extrudeSteps);
		var geometry = new THREE.Geometry();
		geometry.merge(crossSectionGeo, matrix);
		geos.push(geometry);
	}


	// This function is called for each point along the parametric curve.
	// u represents one step along the cross section curve
	// v represents one step along the extrusion curve
	this.surfaceFunc = function(u,v){
		var ext = Math.floor((v*this.options.extrudeSteps)+.0000000001);
		var shape = (Math.floor(((1-u)*(crossSectionGeo.vertices.length-1))+.0000000001));//%crossSectionGeo.vertices.length);
		return  geos[ext].vertices[shape];
	}
	this.uvFunc = this.surfaceFunc.bind(this)
	
	// create side walls
	var result = new THREE.ParametricGeometry(this.uvFunc,crossSectionGeo.vertices.length,this.options.extrudeSteps);
	
	// If we close the extrusion (join the end face back to the starting face), then we won't close it...
	if(this.options.closeExtrusion) {	// close requested, so connect end to beginning
		// Hack Alert, ParametricGeometry can't sew the ends together, so I'll do it manually here
		// fixme - I don't create new faces, I replace the verices in the last crossSection with the corresponding ones in the first crossSection
		var lastVertex = result.vertices.length-(crossSectionGeo.vertices.length+1);
		for(var i = result.faces.length-(2*crossSectionGeo.vertices.length); i < result.faces.length;i++){
			result.faces[i].a = result.faces[i].a >= lastVertex ? result.faces[i].a - lastVertex :result.faces[i].a;
			result.faces[i].b = result.faces[i].b >= lastVertex ? result.faces[i].b - lastVertex :result.faces[i].b;
			result.faces[i].c = result.faces[i].c >= lastVertex ? result.faces[i].c - lastVertex :result.faces[i].c;
		}	
	// if we did not close the extrusion we can either cap or leave the ends open
	} else if(this.options.capExtrusion){	// if not closed, cap if requested
		// create opening end cap
		var matrix = transformer.getTransform(0);
		result.merge(new THREE.ShapeGeometry(crossSection), matrix);

		// create the closing end cap
		var matrix = transformer.getTransform(1);
		var geo = new THREE.ShapeGeometry(crossSection)
		
		// Hack Alert - I can't seem to get this to generate the result with the faces pointing out. I'm going to fix it manually here
		// TJM Would reversing the normals first help?
		for(var i =0; i < geo.faces.length;i++) {
			var tmp = geo.faces[i].a;
			geo.faces[i].a = geo.faces[i].c;
			geo.faces[i].c =tmp;
		}
		result.merge(geo, matrix);
		geos.push(geometry);
	}
	
	// Make sure all of the vertices and faces have normals.
	// this will make it possible to have smooth rendering when the mesh is generated.
	result.computeFaceNormals();
	result.computeVertexNormals();

	return result;
}
			
function followerTransformer(steps,options){
	
	this.steps = steps;
	this.matrices = [];
	
	var ones = new THREE.Vector3(1,1,1);
	var defaultPath = new THREE.LineCurve3(	new THREE.Vector3( 0, 0, 0 ),new THREE.Vector3( 0, 10, 0 ) );
	
	// make sure there are reasonable defaults
	options = options || {};
	options.extrusionPath3 = options.extrusionPath3 !== undefined ? options.extrusionPath3 : defaultPath;		// straight line 10 long along Z
	options.extrusionPath3 = options.extrusionPath3 instanceof THREE.CurvePath ? options.extrusionPath3.r2tor3() : options.extrusionPath3;	// if a 2d shape was given, convert to 3d

	// This provides default functions for scale and rotation. Basically unity in each case.
	options.rotation = options.rotation !== undefined ? options.rotation : function(v) { return 0;};	// zero rotation
	options.scaling = options.scaling !== undefined ? options.scaling : function(v) { return ones;};	// unit scaling
	
	// Get the points and normals for the extrusion path
	// Hack alert - using a very thin tube with one step around the circumference (os it's not really a tube at all) 
	var pathGeo = new THREE.TubeGeometry(options.extrusionPath3,steps,.0000000000001,1,options.closeExtrusion); 

	// create an array of transformation matrices that correspond to each step along the extruder curve
	for(var i = 0;i<=steps;i++){
		var matrix = new THREE.Matrix4();
		matrix.set(
			pathGeo.binormals[i].x,pathGeo.binormals[i].y,pathGeo.binormals[i].z,0,			// bi-normal is perpendicular to normal and tagent at point
			pathGeo.normals[i].x,pathGeo.normals[i].y,pathGeo.normals[i].z,0,				// normal points 'outward', away from the sharpest curvature
			pathGeo.tangents[i].x,pathGeo.tangents[i].y,pathGeo.tangents[i].z,0,			// tangent is tangent  to the curve at point
			pathGeo.vertices[i].x,pathGeo.vertices[i].y,pathGeo.vertices[i].z,1				// point along the curve
		);
		matrix.transpose();																	// THREE stores their matrices column major??
		matrix.multiply(new THREE.Matrix4().makeRotationZ(options.rotation(i/steps)));		// Apply additional external rotation
		var scaling = options.scaling(i/steps); scaling.z=1;								// Apply additional external scaling, force z scale to 1
		matrix.scale(scaling);	//this scales the crossSection plane
		
		this.matrices.push(matrix);															// add the matrix to the array.
	}
	// A utility function used to get the matrix at the appropriate point along the extrusion. v is 0-1 and scaled by the number of steps.
	this.getTransform = function(v) { 
	var i = Math.floor((v*this.steps)+.0000000001);
		return this.matrices[i];
	}
}
