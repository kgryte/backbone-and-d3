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



// Chart Model:
App.Models.Chart = Backbone.Model.extend({

	// Set the default chart parameters:
	defaults: {

		// Transition parameters:
		transition: {
			'onEnter': {
				'duration': 1000,
				'easing': 'linear'
			},
			'onUpdate': {
				'duration': 1000, // this parameter should be tuned to the velocity of incoming data
				'easing': 'linear'
			},
			'onExit': {
				'duration': 1000,
				'easing': 'linear'
			}
		}	

	}

});
