/**
*	A reusable time series statistical graphic with Backbone.js and D3.js
*
*
*
*	Author:
*		Kristofer Gryte
*		http://www.kgryte.com
*
*	History:
*		2013/06/12 - KGryte. Created.
*
*
*	TODO:
*		[1] Decouple view 'data' from view itself. Create a chart model (?) --> a work in progress
*		[2] x and y accessors? Are they necessary? Could this allow for user's to define their own input data structure? e.g., array versus associative array?
*		[3] Replace underscore with lo-dash (?)
*		[4] Stipulate updates
*		[5] Update defaults and validation so that either (a) backbone-nested can be used or (b) such that the config levels do not extend beyond 1, e.g., marginLeft: 10 versus margin: {left: 10, ...}
*		[6] Change axis implementation. Currently, external modification does not make sense, as axis is translated beyond user control
*		[7] Provide validation for internal methods / variables
*		[8] Provide validation for animation and transition settings
*		[9] Refactor validation code to be more compact
*		[10] Ensure standard data representation
*		[11] For real-time sliding window, need to establish a one data point buffer so that the left data edge matches the chart viewport. --> Two ways: 1) create an explicit buffer; 2) fiddle with the collection updates so that the listener fires only on add but not remove. Currently, this is how the buffer is maintained. The downside is that the last time series legend lags.
*		[12] Switch the order such that axes plotted on top of data (?)
*		[13] Resolve the tension between the animation layer and, say, the data layer with regard to transitions. Question to answer: are transitions something fundamental to the graph (to its normal functioning)? If so, then transitions in the data layer; otherwise, something extra (gratuitus). Add/remove methods for new dataseries.
*		[14] Output error messages to a pop up dialog. Currently just logged to console.
*		[15] Add updates for adding and removing time series from the plot
*		[16] 
*		[17] 
*
*
*
*	BUGS:
*		[1] On load, the animation transition is sometimes interrupted. This could be due to the transition() method being over-written. --> Yes! If a listener event is called, say, the user hovers/mousemoves over the plot, the transition is interrupted. 
*
*
*
*	NOTES:
*		[1] Note that, on initialization and set, the full object must be specified for setting an attribute; e.g., margin: {top: , bottom: , left: , right: }
*		[2] Note that xScale and yScale are polymorphic in the data layer --> this makes sense due to data binding; data allows us to calculate domains; each layer should be independent of children inheritors.
*
*
*
*	 Copyright (c) 2013. Kristofer Gryte. http://www.kgryte.com
*	 License: MIT (http://www.opensource.org/licenses/mit-license.php)
*
*/



// Create the line chart layer:
App.Views.DataLayer = App.Views.ChartArea.extend({

	slideWindow: function( model, updatedData ) {

		// Redraw the paths and reset the translation:
		var line = this.model.get('_line');
		this.layer.data.paths.attr('d', function(d) {
				return line( d.get('dataSeries') );
			})
			.attr('transform', null);

		// Reset yDomain to original preference; if originally specified, calculate new max and min:
		this.yScale();

		// 
		var xScale = this.model.get('_xScale'),
			xOffset = this.model.get('_xOffset'),
			props = this.model.get('transition').onUpdate;

		// Update the x domain:
		var xMin = this.data[0].get('dataSeries')[1].x, // We assume a sorted data set
			xMax = _.last( this.data[0].get('dataSeries') ).x,
			xDomain = [ xMin, xMax ],
			xOffset = xDomain[0];
		
		xScale.domain( xDomain );

		this.model.set( {
			'_xDomain': xDomain
		});
		
		// Transition the axes:
		this.layer.axis.x.transition()
			.duration( props.duration ) 
			.ease( props.easing )
			.call( this.model.get('_xAxis') );
		
		this.layer.axis.y.transition()
			.duration( props.duration )
			.ease( props.easing )
			.call( this.model.get('_yAxis') );					

		// Calculate the shift:
		var lastVals = _.last( this.data[0].get('dataSeries'), 2 ),
			shift = xOffset - (lastVals[1].x - lastVals[0].x);

		// Slide the path with a transition:
		this.layer.data.paths.transition()
			.duration( props.duration )
			.ease( props.easing )
			.attr('transform', 'translate(' + xScale( shift ) + ')');

		return this;

	}

}); // end DataLayer



// Animation layer:
App.Views.AnimationLayer = App.Views.InteractionLayer.extend({

	

	bindAnimation: function( ) {

		var selection, animationFcn;
		switch (this.model.get('animation')) {

			case 'enterLeft':

				// Define what is going to animate:
				selection = this.layer.data.paths;

				// Get the x scale and domain:
				var xScale = this.model.get('_xScale'),
					xDomain = xScale.domain();

				// Setup the transition:
				selection.attr("transform", "translate(" + xScale( -xDomain[1] ) + ")");

				// Set the animation function:
				animationFcn = enterLeft;

				break;

			case 'arise':

				// Define what is going to animate:
				selection = this.layer.data.paths;

				// Get the base layer height:
				var height = this.model.get('canvas').height;

				// Setup the transition:
				selection.attr('transform', 'translate(0,' + height + ') scale(1,0)' );

				// Set the animation function:
				animationFcn = arise;

				break;

			default:

				break;

		}; // end SWITCH animation

		// Store the selection to be animated and its associated animation:
		this.model.set({
			"_selection": selection,
			"_animationFcn": animationFcn
		});		

		return this;

		function enterLeft() {

			this.attr('transform', 'translate(' + xScale( xDomain[0] ) + ')');

		}; // end FUNCTION enterLeft()

		function arise() {

			this.attr('transform', 'translate(0,0) scale(1,1)');

		}; // end FUNCTION arise()

	},

	animate: function( ) {

		// Get the selection to be animated:
		var selection = this.model.get('_selection');

		// Get the scales:
		var xScale = this.model.get('_xScale'),
			yScale = this.model.get('_yScale');

		var props = this.model.get('animationProps'),
			duration = props.onEnter.duration,
			easing = props.onEnter.easing;

		var animate = this.model.get('_animationFcn');
		
		selection.transition()
			.duration( duration )
			.ease( easing )
			.call( animate );

		return this;

	},

	

});









Backbone.Validate = function( model, attrs ) {

	var errors = {};
		
	// Get the keys:
	var keys = _.keys(attrs);

	// Iterate over each key and perform the appropriate validation:
	_.each(keys, validator);

	return errors;

	function validator(key) {

		var prefix = 'ERROR:invalid input for "'+ key +'". ';

		var val = attrs[key];
		//console.log(val);
		switch (key) {

			case 'brush':
				// Must be boolean:
				if ( !_.isBoolean( val ) ) {
					errors[key] = prefix + 'Must be a boolean.';
				}; // end IF
				break;

			case 'brushProps':
				// Must be an object:
				if ( !_.isObject( val ) ) {
					errors[key] = prefix + 'Must be an object.';
					return;
				}; // end IF

				var validKeys = ['width', 'height', 'margin'];

				_.each(validKeys, function(validKey) {
					if ( !_.has( val, validKey ) ) {
						errors[key] = prefix + 'Object must have one of the following keys: ' + validKeys;
						return;
					};

					switch (validKey) {
						case 'height': case 'width':
							if ( !_.isFinite( val[validKey] ) ) {
								errors[key] = prefix + validKey + ' must be a finite number.';
							}; // end IF
							break;
						case 'margin':
							// Must be an object:
							if ( !_.isObject( val[validKey] ) ) {
								errors[key][validKey] = prefix + 'Must be an object.';
								return;
							}; // end IF

							var innerValidKeys = ['top', 'bottom', 'left', 'right'];
							
							_.each(innerValidKeys, function(innerValidKey) {
								if ( !_.has( val[validKey], innerValidKey ) ) {
									errors[key][validKey] = prefix + 'Object must have one of the following keys: ' + innerValidKeys;
									return;
								};
								if ( !_.isFinite( val[validKey][innerValidKey] ) ) {
									errors[key][validKey] = prefix + innerValidKey + ' must be a finite number.';
								}; // end IF
							});
							break;
					}; // end SWITCH
					
				});
				break;

			case 'interpolation': case 'animation': case 'mode':
				// Must be a string:
				if ( !_.isString( val ) ) {
					errors[key] = prefix + 'Must be a string.';
				}; // end IF

				var validVals;
				switch (key) {
					case 'interpolation':
						validVals = ['linear', 'linear-closed', 'step', 'step-before', 'step-after', 'basis', 'basis-open', 'basis-closed', 'bundle', 'cardinal', 'cardinal-open', 'cardinal-closed', 'monotone'];
						break;
					case 'animation':
						validVals = ['enterLeft', 'arise'];
						break;
					case 'mode':
						validVals = ['window', 'add', 'dynamic'];
						break;
				}; // end SWITCH (key)

				var index = validVals.indexOf( val );

				if (index == -1) {
					// Value not found:
					errors[key] = prefix + 'Assigned value must be one of the following options: ' + validVals;
				}; // end IF

				break;

			

		}; // end SWITCH

	}; // end FUNCTION validator(key)

}; // end FUNCTION Backbone.validate()