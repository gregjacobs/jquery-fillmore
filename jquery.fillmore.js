/*!
 * jQuery Fillmore
 * Version 1.0.0
 * https://github.com/Gjslick/jquery-fillmore
 *
 * Add a dynamically-resized background image to any element
 *
 * Copyright (c) 2011 Gregory Jacobs (jux.com)
 * Dual licensed under the MIT and GPL licenses.
 */

(function($) {
	
	var defaultSettings = {
		src       : null, // The src for the image
		centeredX : true, // Should we center the image on the X axis?
		centeredY : true, // Should we center the image on the Y axis?
		speed     : 0     // fadeIn speed for background after image loads (e.g. "fast" or 500)
	};
	
	
	/**
	 * @private
	 * @class Fillmore
	 * 
	 * Fillmore class for making an instance on every element that is to have a fillmore'd background.
	 * The constructor initializes the properties and elements that the plugin will use.
	 *
	 * @constructor
	 * @property {HTMLElement|jquery} containerEl The container element where a fillmore'd image should be placed.
	 */
	var Fillmore = function( containerEl ) {
		var fillmoreElPosition = 'absolute';  // will be set to fixed if using the body element as the container element
		
		// Start with the default settings (need a copy)
		this.settings = $.extend( {}, defaultSettings );
		
		
		var $containerEl = this.$containerEl = this.$containerSizingEl = $( containerEl );
		
		// Make sure the container element has a transparent background, so we can see the stretched image
		$containerEl.css( 'background', 'transparent' );
		
		if( $containerEl.is( 'body' ) ) {
			this.$containerSizingEl = ( 'onorientationchange' in window ) ? $( document ) : $( window ); // hack to acccount for iOS position:fixed shortcomings
			fillmoreElPosition = 'fixed';
			
		} else {
			// Make sure we cut the image off at the end of the container element
			this.originalContainerOverflow = $containerEl[ 0 ].style.overflow;
			$containerEl.css( 'overflow', 'hidden' );
			
			// Make sure the container element has a positioning context, so we can position the $fillmoreEl inside it. Must be absolute/relative/fixed.
			// It doesn't need a positioning context if the element is the document body however, as that already has a positioning context.
			if( $containerEl.css( 'position' ) === 'static' ) {  // computed style is 'static', i.e. no positioning context
				$containerEl.css( 'position', 'relative' );
				this.containerPositionModified = true;
			}
			
			// If the element doesn't have a z-index value, we need to give it one to create a stacking context.
			if( $containerEl.css( 'z-index' ) === 'auto' ) {
				$containerEl.css( 'z-index', 0 );
				this.containerZIndexModified = true;  // Flag to tell the destroy() method that we modified the zIndex style, to reset it
			}
		}
		
		
		// The div element that will be placed inside the container, with the image placed inside of it
		this.$fillmoreEl = $( '<div style="left: 0; top: 0; position: ' + fillmoreElPosition + '; overflow: hidden; z-index: -999999; margin: 0; padding: 0; height: 100%; width: 100%;" />' )
			.appendTo( $containerEl );
		
		// Add a handler to adjust the background size when the window is resized or orientation has changed (iOS)
		this.adjustBGProxy = $.proxy( this.adjustBG, this );  // need to store a reference to this function, so we can remove the listener in destroy()
		$( window ).resize( this.adjustBGProxy );
	};
	
	
	$.extend( Fillmore.prototype, {
		
		/**
		 * The configured settings (options) for the instance. This is initialized
		 * to just the default settings, and is updated via the {@link #updateSettings} method.
		 * 
		 * @private
		 * @property settings
		 * @type Object
		 */
		
		/**
		 * The container element that is having a fillmore'd image applied to it.
		 * 
		 * @private
		 * @property $containerEl
		 * @type jQuery
		 */
		
		/**
		 * The element to use to size the fillmore'd element. This is in most cases the {@link #$containerEl} itself, but
		 * in the case that the document body is being used, it becomes either the document object (for iOS), or the window
		 * object for all other OS's.
		 *
		 * @private
		 * @property $containerSizingEl
		 * @type jQuery
		 */
		
		/**
		 * Will store the current image that is displayed when {@link #showImage} is called.
		 *
		 * @private
		 * @property $imgEl
		 * @type jQuery
		 */
		$imgEl : null,
		
		/**
		 * Stores the image ratio of the current image.
		 *
		 * @private
		 * @property imgRatio
		 * @type Number
		 */
		imgRatio : null,
		
		/**
		 * Flag that is set to true if Fillmore modifies the position css property of the container element to give it a 
		 * positioning context. If true, the {@link #destroy} method will remove the applied position property.
		 *
		 * @private
		 * @property containerPositionModified
		 * @type Boolean
		 */
		containerPositionModified : false,
		
		/**
		 * Flag that is set to true if Fillmore modifies the z-index css property of the container element to give it a stacking
		 * context. If true, the {@link #destroy} method will remove the applied z-index.
		 *
		 * @private
		 * @property containerZIndexModified
		 * @type Boolean
		 */
		containerZIndexModified : false,
		
		/**
		 * The element which will hold the fillmore'd image.
		 * 
		 * @private
		 * @property $fillmoreEl
		 * @type jQuery
		 */
		
		
		// ------------------------------------
		
		
		/**
		 * Updates the settings of the instance with any new settings supplied.
		 *
		 * @method updateSettings
		 * @property {Object} settings An object (hash) of settings. Current options include: 'centeredX' (Boolean), 'centeredY' (Boolean), and 'speed' (Int).  
		 */
		updateSettings : function( settings ) {
			this.settings = $.extend( this.settings, settings );
		},
		
		
		/**
		 * Initializes the Fillmore plugin on an element.
		 *
		 * @method showImage
		 * @param {String} src The src for the image to show.
		 * @param {Function} callback (optional) A callback to call when the image has loaded and faded in.
		 */
		showImage : function( src, callback ) {
			// Mark any old image(s) for removal. They will be removed when the new image loads.
			this.$fillmoreEl.find( 'img' ).addClass( 'deletable' );
			
			// Create a new image element
			this.$imgEl = $( '<img style="position: absolute; display: none; margin: 0; padding: 0; border: none; z-index: -999999;" />' )
				.bind( 'load', $.proxy( function( evt ) { this.onImageLoaded( evt, callback ); }, this ) )
				.appendTo( this.$fillmoreEl );
							
			this.$imgEl.attr( "src", src ); // Hack for IE img onload event
		},
		
		
		/**
		 * Method that is called when the image is loaded.
		 *
		 * @private
		 * @method onImageLoaded
		 * @param {jQuery.Event} evt
		 * @param {Function} callback (optional) A callback to call when the image has loaded and faded in.
		 */
		onImageLoaded : function( evt, callback ) {
			var img = evt.target,
				$fillmoreEl = this.$fillmoreEl;
			
			this.$imgEl.css( { width: "auto", height: "auto" } );
			
			var imgWidth = img.width || this.$imgEl.width(),
				imgHeight = img.height || this.$imgEl.height();
			
			// Store the image ratio
			this.imgRatio = imgWidth / imgHeight;
			
			this.adjustBG();
			
			this.$imgEl.fadeIn( this.settings.speed, function() {
				// Remove the old images (if any exist), and remove them
				$fillmoreEl.find( 'img.deletable' ).remove();
				
				// Callback
				if( typeof callback === "function" ) {
					callback();
				}
			} );
		},
		
		
		/**
		 * Adjusts the background image.
		 * 
		 * @private
		 * @method adjustBG
		 */
		adjustBG : function() {
			if( this.$imgEl ) {  // make sure the image has been created, in case of a resize that happens too early
				try {
					var settings = this.settings,
						$containerEl = this.$containerEl,
						$containerSizingEl = this.$containerSizingEl,
						containerHeight = $containerSizingEl.outerHeight() || $containerSizingEl.height(),  // outerHeight() for regular elements, and height() for window (which returns null for outerHeight())
						containerWidth = $containerSizingEl.outerWidth() || $containerSizingEl.width(),	 // outerWidth() for regular elements, and width() for window (which returns null for outerWidth())
						
						bgCSS = { left: 0, top: 0 },
						bgWidth = containerWidth,
						bgHeight = bgWidth / this.imgRatio,
						bgOffset;
					
					
					// Make adjustments based on image ratio
					// Note: Offset code provided by Peter Baker (http://ptrbkr.com/). Thanks, Peter!
					if( bgHeight >= containerHeight ) {
						bgOffset = ( bgHeight - containerHeight ) / 2;
						if( settings.centeredY ) {
							$.extend( bgCSS, { top: "-" + bgOffset + "px" } );
						}
					} else {
						bgHeight = containerHeight;
						bgWidth = bgHeight * this.imgRatio;
						bgOffset = ( bgWidth - containerWidth ) / 2;
						if( settings.centeredX ) {
							$.extend( bgCSS, { left: "-" + bgOffset + "px" } );
						}
					}
					
					// Update the elements
					this.$fillmoreEl.width( bgWidth ).height( bgHeight );
					this.$imgEl.width( bgWidth ).height( bgHeight ).css( bgCSS );
					
				} catch( err ) {
					// IE7 seems to trigger _adjustBG before the image is loaded.
					// This try/catch block is a hack to let it fail gracefully.
				}
			}
		},
		
		
		/**
		 * Retrieves the src of the image that is currently being shown (or is loading).
		 * 
		 * @method getSrc
		 * @return {String} The src of the image currently being shown (or is loading), or null if there is none.
		 */
		getSrc : function() {
			return this.settings.src;
		},
		
		
		/**
		 * Removes the fillmore'd background and resets the container element back to its
		 * original state. 
		 * 
		 * @method destroy
		 */
		destroy : function() {
			// Restore the original position and z-index styles, if Fillmore modified them
			if( this.containerPositionModified ) {				
				this.$containerEl.css( 'position', '' );
			}
			if( this.containerZIndexModified ) {
				this.$containerEl.css( 'z-index', '' );
			}
			
			// Restore the original overflow style
			this.$containerEl.css( 'overflow', this.originalContainerOverflow );
			
			// Remove the fillmore element. The child image element will be removed as well.
			this.$fillmoreEl.remove();
			
			// Remove the window resize handler
			$( window ).unbind( 'resize', this.adjustBGProxy );
			
			// Remove the reference to the Fillmore instance from the element
			this.$containerEl.removeData( 'fillmore' );
		}
		
	} );
	
	
	// --------------------------
	
	
	// jQuery Plugin Code
	// 'settings' may be an object of the settings for fillmore, or a string for a method name to call
	$.fn.fillmore = function( settings ) {
		return this.each( function( idx, el ) {
			// Create an instance on the element if there is none yet
			var $el = $( el ),
				fillmore = $el.data( 'fillmore' );
			
			if( !fillmore ) { // no instance for the element yet
				fillmore = new Fillmore( el );
				$el.data( 'fillmore', fillmore );
			}
			
			
			if( typeof settings === 'object' ) {
				fillmore.updateSettings( settings );
				fillmore.showImage( settings.src, settings.callback );
				
			} else if( typeof settings === 'string' ) {
				// 'settings' is a string, it must be a method call
				fillmore[ settings ].apply( fillmore, Array.prototype.slice.call( arguments, 1 ) );
			}
		} );
	};
	
	
	// Static jQuery method, to maintain the old behavior of automatically attaching the image to the document body.
	$.fillmore = function( settings ) {
		$( 'body' ).fillmore( settings );
	};
  
})(jQuery);
