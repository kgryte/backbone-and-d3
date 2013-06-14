Backbone.js + D3.js
===============

<a href="http://www.d3js.org" target="_blank">D3.js</a> has quickly become the visualization kernel for data visualization on the web, and <a href="http://backbonejs.org/" target="_blank">Backbone.js</a> is an MV* framework used frequently for its flexibility and ease-of-use. 

D3 is a low-level framework for creating data-driven documents, which has empowered developers to create highly bespoke and unique data visualizations.  D3 development is not without downside, however, as development typically entails considerable refactoring when attempting to apply a similar design framework in different data contexts.

Recently, the idea of reusable charts has gained considerable traction. The primary aim is to develop a consistent chart API to facilitate code reuse and modularity. While several efforts have attempted to create reusable chart APIs building atop D3, most of these have followed a similar functional (and declarative) paradigm, as originally outlined by <a href="http://bost.ocks.org/mike/chart/" target="_blank">Mike Bostock</a>, D3's principle maintainer. This approach has its merits, allowing a consistent API through closures.

Nevertheless, the closure approach requires that we first define exactly what can and what cannot be accessible. Once defined, the result is a monolithic function encompassing all behavior and the only way of changing behavior is by directly modifying the source code. In contrast, we may prefer an approach which permits extensibility, similar to that which we find in OOP paradigm class hierarchies. 

Backbone provides such facilities through its `extend' method. Hence, we may ask whether we can leverage Backbone and D3 to create a framework which explicitly separates concerns pertaining to data models and views and explicitly addresses the layered nature of statistical graphics.



---
### Models

Several models form the basis for a chart. 

* DataPoint: the atomic data unit, even if not actually displayed, e.g., in a line chart.
* DataSeries: extends the DataPoint model to manage a collection of data points, i.e., a data series. This is the primary unit for a line chart.
* ChartModel: this is a ViewModel which contains meta data related to the View representation, such as chart margins, axis labels, transition parameters, etc.
* DataCollection: the array of Models to be translated into graphical units. For a line chart, the collection is of data series.


---
### Views

Views correspond to chart layers. Each additional layer within a hierarchy extends the Views of layers below. This makes the implementation more modular and provides flexibility to include layers (functionality) only as needed.


#### Layers

Multiple layers comprise a chart. 

* Chart Base: the layer which creates the base canvas and defines chart dimensions
	* this layer exists as 'ChartBase'
* Chart Area: the layer which creates axes (lines, ticks, labels) and specifies the x and y scales 
	* this layer exists as 'ChartArea'
* Line Chart: the layer which actually plots the data
	* this layer exists as 'DataLayer'
* Listeners: a meta-layer which coordinates model updates and corresponding view changes
	* this layer exists as 'ListenerLayer'
* Interaction: the layer which enables user interaction, e.g., providing additional context upon hover
	* this layer exists as 'InteractionLayer'
* Animation: the layer which introduces transition animations for various lifecycle events
	* this layer exists as 'AnimationLayer'


---
### Classes

Classes are assigned within each chart layer, providing a more direct API for CSS and JS targeting.

* base: canvas layer, i.e., the SVG element
* chart: chart layer, i.e., the SVG group element holding all chart contents
* axis: axes layer, which is further classed by 
	* x: x axis
	* y: y axis
* label: axes labels
* data-series: the group of data sets plotted, even if only 1 data set
* line: the SVG path element for an individual data series, which is further classed in order of generation
	* line0: first line
	* line1: second line
	* ...
	* line(M-1): mth line


---
### Dependencies

This implementation uses multiple libraries/frameworks.

* D3.js: a visualization kernel.
* Backbone.js: an MV* framework.
* Underscore.js: a utility library used by Backbone.js
* jQuery.js: a general purpose library



---
### References

Several works have influenced this implementation. In no particular order:
* Mike Bostock's <a href="http://bost.ocks.org/mike/chart/" target="_blank">Towards Reusable Charts</a>
* Bocoup's <a href="http://weblog.bocoup.com/reusability-with-d3/" target="_blank">Reusability with D3</a> (and Github <a href="https://github.com/jugglinmike/d3-experiments" target="_blank">repository</a>)
* Shirley Wu's <a href="http://shirley.quora.com/Marrying-Backbone-js-and-D3-js" target="_blank">Marrying Backbone.js and D3.js</a>
* <a href="http://www.twitter.com/jtuulos" target="_blank">@jtuulos</a> talk at the <a href="http://jtuulos.github.io/bayd3-may2013/#/" target="_blank">San Francisco D3.js Meetup</a>
* <a href="http://www.twitter.com/milr0c" target="_blank">@milr0c</a> talk at the <a href="http://bl.ocks.org/milroc/raw/5553051/#0" target="_blank">San Francisco D3.js meetup</a> and associated <a href="http://bl.ocks.org/milroc/5522467" target="_blank">Gist</a>
* Christophe Viau's book <a href="https://gumroad.com/l/vyYr/" target="blank">Developing a D3.js Edge</a>
* Trifacta's <a href="https://github.com/trifacta/vega/wiki/Tutorial" target="_blank">Vega</a>



---
### Copyright

Copyright (c) 2013. <a href="http://www.kgryte.com" target="_blank">Kristofer Gryte</a>.
License: <a href="http://www.opensource.org/licenses/mit-license.php" target="_blank">MIT</a>



