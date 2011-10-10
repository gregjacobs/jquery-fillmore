/*global module, test, asyncTest, start, strictEqual*/
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
	
	
	asyncTest( "should return false after the image has loaded, but has not yet faded in", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( { 
			src : '../examples/coffee.jpg',
			speed : 500   // make it fade for half a second
		} );
		
		// Access private member of the Fillmore object to determine when the image has loaded.
		// This callback should be run before the image has faded in, resulting in isLoaded() returning false.
		$fixture.data( 'fillmore' ).$imgEl.bind( {
			'load' : function() {
				// restart the test
				start();
				
				strictEqual( $fixture.fillmore( 'isLoaded' ), false );  // image hasn't been faded in yet, should return false
			}
		} );
	} );
	
})();