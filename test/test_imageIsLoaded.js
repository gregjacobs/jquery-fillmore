/*global $, module, test, asyncTest, start, strictEqual */
(function() {

	module( "imageIsLoaded", {
		setup : function() {
			
		},
		teardown : function() {
			$( '#qunit-fixture' ).fillmore( 'destroy' );
		}
	} );
	
	
	
	test( "should return false if the image is not yet loaded", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( { src : '../examples/coffee.jpg' } );
		strictEqual( $fixture.fillmore( 'imageIsLoaded' ), false );
	} );
	
	
	asyncTest( "should return true once the image has loaded", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( {
			src : '../examples/coffee.jpg',
			speed : 150,
			
			onImageLoad : function() {
				start();
				
				strictEqual( $fixture.fillmore( 'imageIsLoaded' ), true );
			}
		} );
	} );
	
})();