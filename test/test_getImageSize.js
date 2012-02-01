/*global $, module, test, asyncTest, start, strictEqual */
(function() {

	module( "getImageSize", {
		setup : function() {
			
		},
		teardown : function() {
			$( '#qunit-fixture' ).fillmore( 'destroy' );
		}
	} );
	
	
	
	test( "should return null if the image is not yet loaded", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( { src : '../examples/coffee.jpg' } );
		strictEqual( $fixture.fillmore( 'getImageSize' ), null );
	} );
	
	
	asyncTest( "should return the size of the image in non-CSS3 mode", 2, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( {
			src : '../examples/coffee.jpg',
			noCss3 : true,
			
			callback : function() {
				start();
				
				var imageSize = $fixture.fillmore( "getImageSize" );
				strictEqual( imageSize.width, 1024 );
				strictEqual( imageSize.height, 983 );
			}
		} );
	} );
	
	
	asyncTest( "should return the size of the image in CSS3 mode", 2, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( {
			src : '../examples/coffee.jpg',
			forceCss3 : true,
			
			callback : function() {
				start();
				
				var imageSize = $fixture.fillmore( "getImageSize" );
				strictEqual( imageSize.width, 1024 );
				strictEqual( imageSize.height, 983 );
			}
		} );
	} );
	
	
})();