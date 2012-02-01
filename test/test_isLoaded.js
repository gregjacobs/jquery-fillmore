/*global $, module, test, asyncTest, start, strictEqual */
(function() {

	module( "isLoaded", {
		setup : function() {
			
		},
		teardown : function() {
			$( '#qunit-fixture' ).fillmore( 'destroy' );
		}
	} );
	
	
	
	test( "should return false on an element that has never been Fillmore'd", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		
		strictEqual( $fixture.fillmore( 'isLoaded' ), false );
	} );
	
	
	test( "should return false while the image is loading", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( { src : '../examples/coffee.jpg' } );
		strictEqual( $fixture.fillmore( 'isLoaded' ), false );
	} );
	
	
	asyncTest( "should return true after the image has loaded and faded in", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( { 
			src : '../examples/coffee.jpg',
			callback : function() {
				// restart the test
				start();
				
				strictEqual( $fixture.fillmore( 'isLoaded' ), true );
			} 
		} );
	} );
	
})();