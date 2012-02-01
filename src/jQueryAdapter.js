// jQuery Adapter Code

/*global window, jQuery, Modernizr */
(function( $ ) {
	
	// 'settings' may be an object of the settings for fillmore, or a string for a method name to call
	// The default settings are located in $.Fillmore.settings
	var jQueryApi = {
		init : function( settings ) {
			for( var i = 0, len = this.length; i < len; i++ ) {
				var el = this[ i ], $el = $( el ), fillmore = $el.data( 'fillmore' );
				
				// Create an instance on the element if there is none yet
				if( !fillmore ) {
					if ( $.Fillmore.useCss3 && !settings.noCss3 ) {
						fillmore = new $.FillmoreCss3( el );
					} else {
						fillmore = new $.FillmoreImageStretch( el );	
					}

					$el.data( 'fillmore', fillmore );
				}
				
				fillmore.updateSettings( settings );
				fillmore.showImage( settings.src, settings.callback );				
			}
			return this;
		},
		
		isLoaded : function() {
			var el = this[ 0 ], fillmore;
			if( el && ( fillmore = $( el ).data( 'fillmore' ) ) ) {
				return fillmore.isLoaded();
			} else {
				return false;  // element isn't fillmore'd, return false
			}
		},
		
		getSrc : function() {
			var el = this[ 0 ], fillmore;
			if( el && ( fillmore = $( el ).data( 'fillmore' ) ) ) {
				return fillmore.getSrc();
			} else {
				return undefined;
			}
		},
		
		getImageSize : function() {
			var el = this[ 0 ], fillmore;
			if( el && ( fillmore = $( el ).data( 'fillmore' ) ) ) {
				return fillmore.getImageSize();
			} else {
				return undefined;
			}
		},
		
		resize : function() {
			for( var i = 0, len = this.length; i < len; i++ ) {
				var $el = $( this[ i ] ), fillmore = $el.data( 'fillmore' );
				if( fillmore ) {
					fillmore.resize();
				}
			}
			return this;
		},
		
		destroy : function() {
			for( var i = 0, len = this.length; i < len; i++ ) {
				var $el = $( this[ i ] ), fillmore = $el.data( 'fillmore' );
				if( fillmore ) {
					fillmore.destroy();
					$el.removeData( 'fillmore' );
				}
			}
			return this;
		}
	};
	
	// For jQuery wrapped sets
	$.fn.fillmore = function( settings ) {
		if( typeof settings === 'string' && jQueryApi[ settings ] ) {
			return jQueryApi[ settings ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
			
		} else if( typeof settings === 'object' || !settings ) {
			return jQueryApi.init.apply( this, arguments );
			
		} else {
			$.error( "Method '" + settings + "' does not exist on Fillmore." );
		}
	};
	
	
	// Static jQuery method, to maintain the old behavior of automatically attaching the image to the full page.
	$.fillmore = function( settings ) {
		return $( 'body' ).fillmore( settings );
	};
	
})( jQuery );