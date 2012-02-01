/**
 * @class $.FillmoreImageStretch
 * @extends $.Fillmore
 * 
 * Image stretching implementation used for older browsers that don't support the CSS3
 * background-size:cover property (or don't support it well).
 */
/*global window, jQuery */
(function( $ ) {
	
	/**
	 * Creates a new FillmoreImageStretch instance.
	 * 
	 * @constructor
	 * @param {HTMLElement/jquery} containerEl The container element where a fillmore'd image should be placed.
	 */
	$.FillmoreImageStretch = function( containerEl ) {
		this.init( containerEl );
	};
	
	
	$.extend( $.FillmoreImageStretch.prototype, $.Fillmore.prototype, {
		
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
		 * Flag to determine if the image itself is currently loaded. This flag is reset back to false
		 * when a new image is loaded.
		 * 
		 * @private
		 * @property imgLoaded
		 * @type Boolean
		 */
		imgLoaded : false,
		
		
		// ------------------------------------
		

		/**
		 * Initializes the special containerSizing element, which is referenced
		 * to accurately compute the container dimensions.
		 *
		 * @method init
		 * @property {HTMLElement/jquery} containerEl The container element where a fillmore'd image should be placed.
		 */
		init : function( containerEl ) {
			$.Fillmore.prototype.init.apply( this, arguments );

			if( this.$containerEl.is( 'body' ) ) {
				this.$containerSizingEl = ( 'onorientationchange' in window ) ? $( document ) : $( window ); // hack to acccount for iOS position:fixed shortcomings
			} else {
				this.$containerSizingEl = this.$containerEl;
			}
			
			// Add a handler to adjust the background size when the window is resized or orientation has changed (iOS)
			this.resizeProxy = $.proxy( this.resize, this );  // need to store a reference to this function, so we can remove the listener in destroy()
			$( window ).resize( this.resizeProxy );
		},


		/**
		 * Retrieve the img element.
		 *
		 * @method getImageEl
		 * @return {jQuery}
		 */
		getImageEl : function() {
			return this.$imgEl;
		},


		/**
		 * Initializes the Fillmore plugin on an element.
		 *
		 * @method showImage
		 * @param {String} src The src for the image to show.
		 * @param {Function} callback (optional) A callback to call when the image has loaded and faded in.
		 */
		showImage : function( src, callback ) {
			$.Fillmore.prototype.showImage.apply( this, arguments );
			
			// Reset flags since we're showing a new image
			this.imgLoaded = false;
			this.loaded = false;
			
			// Create a new image element
			this.$imgEl = $( '<img style="position: absolute; display: none; margin: 0; padding: 0; border: none; z-index: -999999;" />' )
				.bind( 'load error', $.proxy( function( evt ) { this.onImageLoaded( evt, callback ); }, this ) )
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
				$imageEl = this.getImageEl();
			
			// If the image that has loaded is not the current image (the latest image), simply return out. 
			// We will "throw away" this image, as a new one is currently loading. This fixes a weird issue
			// where the fadeIn() method's callback will continually be called if a new image is requested
			// while one or more old ones are still loading.
			if( img !== $imageEl[ 0 ] ) {
				return;
			}

			$.Fillmore.prototype.onImageLoaded.apply( this, arguments );
			
			this.imgLoaded = true;
			
			$imageEl.css( { width: "auto", height: "auto" } );
			
			var imgWidth = img.width || $imageEl.width(),
				imgHeight = img.height || $imageEl.height();
			
			// Store the image ratio, and resize
			this.imgRatio = imgWidth / imgHeight;
			this.resize();
		},
		
		
		/**
		 * Resizes the background image to the proper size, and fixes its position based on the container size.
		 * 
		 * @method resize
		 */
		resize : function() {
			if( this.$imgEl && this.imgLoaded ) {  // make sure the image has been created and loaded, in case of a resize that happens too early
				try {
					var settings = this.settings,
						$containerEl = this.$containerEl,
						$containerSizingEl = this.$containerSizingEl,
						containerHeight = $containerSizingEl.outerHeight() || $containerSizingEl.height(),  // outerHeight() for regular elements, and height() for window (which returns null for outerHeight())
						containerWidth = $containerSizingEl.outerWidth() || $containerSizingEl.width(),	 // outerWidth() for regular elements, and width() for window (which returns null for outerWidth())
						
						bgCSS = { left: 0, top: 0 },
						bgWidth = containerWidth,
						bgHeight = bgWidth / this.imgRatio;
					
					
					// Make adjustments based on image ratio
					// Note: Offset code inspired by Peter Baker (http://ptrbkr.com/). Thanks, Peter!
					if( bgHeight >= containerHeight ) {
						var topOffset = ( bgHeight - containerHeight ) * this.settings.focusY / 100;
						$.extend( bgCSS, { top: "-" + topOffset + "px" } );
					} else {
						bgHeight = containerHeight;
						bgWidth = bgHeight * this.imgRatio;
						var leftOffset = ( bgWidth - containerWidth ) * this.settings.focusX / 100;
						$.extend( bgCSS, { left: "-" + leftOffset + "px" } );
					}
					
					// Update the elements
					this.$fillmoreEl.width( bgWidth ).height( bgHeight );
					this.$imgEl.width( bgWidth ).height( bgHeight ).css( bgCSS );
					
				} catch( err ) {
					// IE7 seems to trigger resize() before the image is loaded.
					// This try/catch block is a hack to let it fail gracefully.
					// Note: This is a holdover from jQuery Backstretch. Keeping this here just in case.
				}
			}
		},
		
		
		/**
		 * Removes the fillmore'd background and resets the container element back to its
		 * original state. 
		 * 
		 * @method destroy
		 */
		destroy : function() {
			$.Fillmore.prototype.destroy.apply( this, arguments );


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
			$( window ).unbind( 'resize', this.resizeProxy );
		}
		
	} );
	
})( jQuery );