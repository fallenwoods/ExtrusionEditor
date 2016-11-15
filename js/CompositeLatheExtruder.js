

// Extend the THREE.Curve and THREE.CurvePath objects to add translation,scaling and rotation
//fexme - make these not be enumerable
THREE.CurvePath.prototype.getBoundingBox = function(){ 
	for(var i = 0; i< this.curves.length;i++){
		
	}
}
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
THREE.Vector2.prototype.applyMatrix4 = function (matrix){
	matrix.applyToVector3Array([this]);
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

function CompositeLatheExtruder (crossSection, extrusion, lathe, rotation, stepsAround, stepsAlong, options) {
	this.options = options || {}
	
//this.options.closeExtrusion = true; //debug
//this.options.capExtrusion = false;
//this.options.closeCrossSection = false;


	//fixme - rotate extrusion around x so that y becomes z
	// Collect options and set defaults
	this.options.closeExtrusion = this.options.closeExtrusion !== undefined ? this.options.closeExtrusion : false;
	this.options.closeCrossSection = this.options.closeCrossSection !== undefined ? this.options.closeCrossSection : true;
	this.options.capExtrusion = this.options.capExtrusion !== undefined ? this.options.capExtrusion : true;

	crossSection.autoClose = this.options.closeCrossSection;
	
	// Get the points along the cross section curve 
	var crossSectionGeo = crossSection.createPointsGeometry(stepsAround);
	//var extrusionGeo =  new THREE.TubeGeometry(options.extrusionPath3,stepsAlong,.0000000000001,1,options.closeExtrusion); 
	this.rotation = rotation;
	this.lathe = lathe;
	var latheGeo = lathe.createPointsGeometry(stepsAlong);
	latheGeo.computeBoundingBox();
	var latheRange = latheGeo.boundingBox;
	var geos=[]; 
	
	this.getExtrusionTransform  = function(v){		// v 0-> 1

		
		var smallUDelta = 1/(stepsAlong*10);		// a tenth of the distance between steps.
		var vertex = extrusion.getPoint(v).r2tor3();	// Will make Vector2 a Vector3 if needed.
		var tangent = extrusion.getTangent(v).r2tor3();
		//fixme  - if tangent == dTangent, we need to use something else for normal and binormal
		var dTangent = extrusion.getTangent((v + smallUDelta) > 1 ? v - smallUDelta : v + smallUDelta).r2tor3();	// Get a 2nd tangent close to the first, make sure we don't go past the end of the curve
		var binormal;
		var normal;
		// if the dot product is close to one the tangents are co-linear and we can't use them to find the binormal and normal
		// fixme sign()
		if(true){//Math.abs(tangent.dot(dTangent)) > .999999){	
			//var shortest = tangent.x < tangent.y ? (tangent.x < tangent.z ? 'x': tangent.y < tangent.z ? 'y' : 'z') : (tangent.y < tangent.z ? 'y' : tangent.x < tangent.z ? 'x' : 'z');
			// Ok if in the z=0 plane
			binormal = new THREE.Vector3(0,0,1);
			normal = new THREE.Vector3(-tangent.y,tangent.x,0).normalize();
		} else {
			binormal = (v + smallUDelta) ? new THREE.Vector3().crossVectors(tangent,dTangent).normalize() : new THREE.Vector3().crossVectors(dTangent,tangent).normalize();		
			normal = new THREE.Vector3().crossVectors(tangent,binormal).normalize();
		}
		
		
		var matrix = new THREE.Matrix4();
		matrix.set(
			binormal.x,binormal.y,binormal.z,0,			// bi-normal is perpendicular to normal and tagent at point
			normal.x,normal.y,normal.z,0,				// normal points 'outward', away from the sharpest curvature
			tangent.x,tangent.y,tangent.z,0,			// tangent is tangent  to the curve at point
			vertex.x,vertex.y,vertex.z,1				// point along the curve
		);
		matrix.transpose();																	// THREE stores their matrices column major??
		matrix.multiply(new THREE.Matrix4().makeRotationZ(this.rotation.getPoint(v).x*2*Math.PI));

		
		return(matrix);														// add the matrix to the array.
	}

	// This function is called for each point along the parametric curve.
	// u represents one step along the cross section curve
	// v represents one step along the extrusion curve
	// 
	this.curMatrix;
	this.curV;

	this.surfaceFunc = function(u,v){
		// If we are close to the end of the figure, deal with closing the Extrusion
		if(v > .999999 && this.options.closeExtrusion){
			v = 0;	//loop to the first points if we are at the end and the extrusion is closed
			
			// deal with rotation (twist) - try to match up the start and end points based on their current angluar offset (for closed cross sections)
			var uOffset = ((this.rotation.getPoint(1).x - this.rotation.getPoint(0).x) % 1 + 1 ) % 1;	// Get the proportion around cross section represented by the start to end twist 0->1
			if(this.options.closeCrossSection){			
				u -= uOffset;
				u = (u + 1) % 1;
			} else {	// for open crossections, reverse the points when the angle is closer to 180 degrees.
				u = (uOffset < .25 || uOffset >= .75) ? u : 1-u;	
			}
		}

		var pt = this.lathe.getPoint(v);
		if (v !== this.curV) {
			this.curV = v;
			var adjustedV = (pt.y - latheRange.min.y)/(latheRange.max.y - latheRange.min.y);
			// fixme - cache matrix for next request (or cache the matrix applied to the crossSection. Don't need an array, once v changes, throw it away.
			this.curMatrix = this.getExtrusionTransform(adjustedV);
		}
		// use curMatrix
		var crossSectionPt = crossSection.getPoint(u);
		crossSectionPt = crossSectionPt.r2tor3();				// make this a 3d point
		crossSectionPt.multiplyScalar(pt.x);		//expand the crossSection to the lathe curve (z should be 0)
		crossSectionPt.applyMatrix4(this.curMatrix);	//now apply the effect of the extrusion...
		
		return  crossSectionPt;
	}.bind(this)

	
	// use this.surfaceFunc() to create side wall geometry 
	var result = new THREE.ParametricGeometry(this.surfaceFunc,stepsAround,stepsAlong);	
	


	
	// If we close the extrusion (join the end face back to the starting face), then we won't close it...
	/*
	if(this.options.closeExtrusion) {	// close requested, so connect end to beginning

		var vertices = result.vertices;
		var count = crossSectionGeo.vertices.length-1;	// fixme - I assumed this would be 'u' steps, but it's steps * (curves in crossection) e.g. 8 curves and steps = 10 -> 81 points
		
		var firstEndVertex =  vertices.length-(count+1);
		var minDistance = Number.MAX_VALUE;
		var curDistance = minDistance;
		var closest=0;
		// fixme-- this does not work well for linear 'cross sections' - it is good for 'circular' closed cross sections
		// e.g. a mobius strip does not join the first vertex to the last, instead if finds a near point resulting in a tear when you are not close to 180 degrees
		// Find the point nearest to the first vertex
		for(var i = 0; i < count ; i++){ 
			if((curDistance = vertices[firstEndVertex].distanceTo(vertices[i])) < minDistance) {
				minDistance = curDistance;
				closest = i;
			}
		}
		//Once we have found the closest point, join the first and closest and then work around the circle. Use modulo to return to first point
		for (var i = 0; i < count; i++){
			result.faces.push(new THREE.Face3((i+closest)%count,(firstEndVertex+i),(firstEndVertex+i+1)));
			result.faces.push(new THREE.Face3((i+closest)%count,(firstEndVertex+i+1),(i+closest)%count+1));
			var u0 = ((i+closest)%count)/count;
			var u1 = ((i+closest)%count + 1)/count;
			var v0 = 1-(1/this.options.extrudeSteps);
			var v1 = 1;
			result.faceVertexUvs[0].push([new THREE.Vector2(u0,v1),new THREE.Vector2(u0,v0),new THREE.Vector2(u1,v0)]);
			result.faceVertexUvs[0].push([new THREE.Vector2(u0,v1),new THREE.Vector2(u1,v0),new THREE.Vector2(u1,v1)]);

		}
	} else
	*/
	// if we did not close the extrusion we can either cap or leave the ends open		
	if(this.options.capExtrusion){	// if not closed, cap if requested
		// fixme - maybe the better way to do this is to use parametric geo with anaon functions returning the clockwise and cc end caps points given u 0->1
		// create opening end cap
			// use this.surfaceFunc() to create side wall geometry 
		var caps = new THREE.ParametricGeometry(this.surfaceFunc,stepsAround,1);	
		
		///========================
		var matrix = this.getExtrusionTransform(0); //fixme - why is the matrix 0 and lathe point 1? I think one or the other is 'upsided down' wrt u.
		var pt = this.lathe.getPoint(1);
		var m2 = new THREE.Matrix4().makeScale(pt.x,pt.x,1);
		matrix.multiply(m2);
		result.merge(new THREE.ShapeGeometry(crossSection), matrix);

		// create the closing end cap
		var matrix = this.getExtrusionTransform(1);
		var pt = this.lathe.getPoint(0);
		var m2 = new THREE.Matrix4().makeScale(pt.x,pt.x,1);
		matrix.multiply(m2);
		var geo = new THREE.ShapeGeometry(crossSection);
		//result.merge(new THREE.ShapeGeometry(crossSection), matrix);
		
		// Hack Alert - I can't seem to get this to generate the result with the faces pointing out. I'm going to fix it manually here
		// TJM Would reversing the normals first help?
		
		for(var i =0; i < geo.faces.length;i++) {
			var tmp = geo.faces[i].a;
			geo.faces[i].a = geo.faces[i].c;
			geo.faces[i].c =tmp;
		}
		
		result.merge(geo, matrix);
		
	}
	
	// Make sure all of the vertices and faces have normals.
	// this will make it possible to have smooth rendering when the mesh is generated.
	result.computeFaceNormals();
	result.computeVertexNormals();

	return result;
}
			

