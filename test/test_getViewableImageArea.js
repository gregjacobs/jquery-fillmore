/*global jQuery, $, module, test, asyncTest, start, strictEqual */
(function() {

	var $customElement;

	module( "getViewableImageArea", {
		setup : function() {
			$customElement = jQuery( '<div style="height: 600px; width: 500px;" />' )
				.appendTo( '#qunit-fixture' );
		},
		teardown : function() {
			$customElement.fillmore( 'destroy' );
		}
	} );
	
	
	
	test( "should return null if the image is not yet loaded", 1, function() {
		$customElement.fillmore( { src : '../examples/mother.jpg' } );
		strictEqual( $customElement.fillmore( 'getViewableImageArea' ), null );
	} );
	
	
	// -----------------------------------------
	
	
	var assertViewableAreaValues = function( viewableArea ) {
		// Round these to 2 decimal places
		viewableArea.offsetLeft = Math.round( 100 * viewableArea.offsetLeft ) / 100;
		viewableArea.stretchedWidth = Math.round( 100 * viewableArea.stretchedWidth ) / 100;
		
		strictEqual( viewableArea.height, 600 );
		strictEqual( viewableArea.width, 500 );
		strictEqual( viewableArea.offsetTop, 0 );
		strictEqual( viewableArea.offsetLeft, 95.62 );  // round to 2 decimal places
		strictEqual( viewableArea.stretchedHeight, 600 );
		strictEqual( viewableArea.stretchedWidth, 691.24 );  // round to 2 decimal places
	};
	
	asyncTest( "should return the properties of the viewable area when the image is loaded, in non-CSS3 mode", 6, function() {
		$customElement.fillmore( {
			src    : '../examples/mother.jpg',
			speed  : 150,
			noCss3 : true,
			
			onImageVisible : function() {
				start();
				
				var viewableArea = $customElement.fillmore( 'getViewableImageArea' );
				assertViewableAreaValues( viewableArea );
			}
		} );
	} );
	
	
	asyncTest( "should return the properties of the viewable area when the image is loaded, in CSS3 mode", 6, function() {
		$customElement.fillmore( {
			src    : '../examples/mother.jpg',
			speed  : 150,
			forceCss3 : true,
			
			onImageVisible : function() {
				start();
				
				var viewableArea = $customElement.fillmore( 'getViewableImageArea' );
				assertViewableAreaValues( viewableArea );
			}
		} );
	} );
	
})();