/*global module, test, strictEqual*/
(function() {

	module( "getSrc", {
		setup : function() {
			
		},
		teardown : function() {
			$( '#qunit-fixture' ).fillmore( 'destroy' );
		}
	} );
	
	
	
	test( "should return undefined on an element that has never been Fillmore'd", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		
		strictEqual( $fixture.fillmore( 'getSrc' ), undefined );
	} );
	
	
	test( "should return the src of the image of the element", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		
		$fixture.fillmore( { src : '../examples/coffee.jpg' } );
		strictEqual( $fixture.fillmore( 'getSrc' ), '../examples/coffee.jpg' );
	} );
	
	
	test( "should return the src of the image of the first element in the wrapped set", 1, function() {
		var $fixture = $( '#qunit-fixture' );
		for( var i = 1; i <= 3; i++ ) {
			$( '<div>' ).appendTo( $fixture ).fillmore( { src : 'img' + i + '.jpg' } );
			
		}
		
		strictEqual( $fixture.find( 'div' ).fillmore( 'getSrc' ), 'img1.jpg' );
	} );
	
})();