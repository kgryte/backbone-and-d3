/**
*
*
*
*
*
*
*
*
*/


// Unit Tests //


////////////////
// Model: Canvas
module( "model: canvas" );

// 
test( "Tests: canvas model", function() {
	expect(7);

	var canvas = new Canvas();
	var _test = canvas.toJSON();

	// Ensure initialization works:
	raises( function() {
		var _canvas = new Canvas({'margin': ['50']});
	}, "Model should throw an exception when improperly initialized.");

	var _canvas = new Canvas({});
	deepEqual( _canvas.toJSON(), _test, "Model should initialize with empty object.");

	// Prevent users from setting arbitrary attributes:
	canvas.set('abc', 4);
	deepEqual( canvas.toJSON(), _test, "Model should not change: unallowed attribute." );

	// Prevent users from setting improper types:
	canvas.set('marginLeft', 'hfdfd');
	deepEqual( canvas.toJSON(), _test, "Model should not change: unallowed type." );

	// Ensure users adhere to API:
	canvas.set('margin', [90, 50]);
	deepEqual( canvas.toJSON(), _test, "Model should not change: margin must be 4 element array.");

	// Ensure margin and convenience attributes are consistent:
	canvas.set('margin', [30, 80, 50, 80]);
	equal( canvas.get('margin')[0], canvas.get('marginTop'), "Model should remain consistent: margin updates.");
	canvas.set('marginRight', 90);
	equal( canvas.get('margin')[1], canvas.get('marginRight'), "Model should remain consistent: convenience attribute updates.");

});



////////////////
// Model: Annotations
module( "model: annotations" );

// 
test( "Tests: annotations model", function() {
	expect(6);

	var annotations = new Annotations();
	var _test = annotations.toJSON();

	// Ensure initialization works:
	raises( function() {
		var _annotations = new Annotations({'legend': 5});
	}, "Model should throw an exception when improperly initialized.");

	var _annotations = new Annotations({});
	deepEqual( _annotations.toJSON(), _test, "Model should initialize with empty object.");

	// Prevent users from setting arbitrary attributes:
	annotations.set('abc', 4);
	deepEqual( annotations.toJSON(), _test, "Model should not change: unallowed attribute." );

	// Prevent users from setting improper types:
	annotations.set('title', 5);
	deepEqual( annotations.toJSON(), _test, "Model should not change: unallowed type." );

	// Ensure users adhere to API:
	annotations.set('legend', ['Item 1', 2]);
	deepEqual( annotations.toJSON(), _test, "Model should not change: legend must be an array of strings.");
	annotations.set('dataCursor', 1);
	deepEqual( annotations.toJSON(), _test, "Model should not change: dataCursor must be a boolean.");

});




////////////////
// Model: Annotations
module( "model: axes" );

// 
test( "Tests: axes model", function() {
	expect(7);

	var axes = new Axes();
	var _test = axes.toJSON();

	// Ensure initialization works:
	raises( function() {
		var _axes = new Axes({'xLabel': 5});
	}, "Model should throw an exception when improperly initialized.");

	// Prevent users from setting arbitrary attributes:
	axes.set('abc', 4);
	deepEqual( axes.toJSON(), _test, "Model should not change: unallowed attribute." );

	// Prevent users from setting improper types:
	axes.set('xLabel', 5);
	deepEqual( axes.toJSON(), _test, "Model should not change: unallowed type." );

	// Prevent users from setting unallowed values:
	axes.set('xOrient', 'left');
	deepEqual( axes.toJSON(), _test, "Model should not change: unallowed value." );

	axes.set('xDomain', [1]);
	deepEqual( axes.toJSON(), _test, "Model should not change: domain must be 2 element array." );
	axes.set('xRange', [1, 'a']);
	deepEqual( axes.toJSON(), _test, "Model should not change: range elements must be finite numbers." );

	axes.set('xType', 'gmt');
	deepEqual( axes.toJSON(), _test, "Model should not change: scale type is restricted to a set of strings." );



});