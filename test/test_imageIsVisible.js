/*global $, module, test, asyncTest, start, strictEqual */
(function() {

	module( "imageIsLoaded", {
		setup : function() {
			
		},
		teardown : function() {
			$( '#qunit-fixture' ).fillmore( 'destroy' );
		}
	} );
	
	
	
	test( "should return false if the image is not yet loaded or visible", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( { src : '../examples/coffee.jpg' } );
		strictEqual( $fixture.fillmore( 'imageIsVisible' ), false );
	} );
	
	
	asyncTest( "should return false once the image has loaded, but is still not yet visible", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( {
			src : '../examples/coffee.jpg',
			speed : 150,
			
			onImageLoad : function() {
				start();
				
				strictEqual( $fixture.fillmore( 'imageIsVisible' ), false );  // should not be visible yet
			}
		} );
	} );
	
	
	asyncTest( "should return true once the image has loaded, and has been faded in", 2, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( {
			src : '../examples/coffee.jpg',
			speed : 150,
			
			onImageVisible : function() {
				start();
				
				strictEqual( $fixture.fillmore( 'imageIsLoaded' ), true );
				strictEqual( $fixture.fillmore( 'imageIsVisible' ), true );
			}
		} );
	} );
	
	
	asyncTest( "should return true immediately after the image has loaded, if there is no 'fade in' speed", 2, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( {
			src : '../examples/coffee.jpg',
			speed : 0,
			
			onImageVisible : function() {
				start();
				
				strictEqual( $fixture.fillmore( 'imageIsLoaded' ), true );
				strictEqual( $fixture.fillmore( 'imageIsVisible' ), true );
			}
		} );
	} );
	
})();