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
		$.Fillmore.apply( this, arguments );
	};
	
	
	$.extend( $.FillmoreImageStretch.prototype, $.Fillmore.prototype, {
		
		/**
		 * @private
		 * @property {jQuery} $imgEl
		 * 
		 * Will store the current image that is displayed when {@link #showImage} is called.
		 */
		$imgEl : null,
	
		/**
		 * @private
		 * @property {jQuery} $oldImage
		 * 
		 * The old img element to be deleted once a new image has been loaded, and just before 
		 * the new image is inserted. Used with multiple calls to fillmore on a given element.
		 */
		$oldImage : null,
		
		
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
			
			// Add a handler to adjust the background size when the window is resized or orientation has changed (iOS)
			this.resizeProxy = $.proxy( this.resize, this );  // need to store a reference to this function, so we can remove the listener in destroy()
			$( window ).resize( this.resizeProxy );
		},


		/**
		 * Retrieve the img element, or null if it has not been created yet.
		 *
		 * @protected
		 * @method getImageEl
		 * @return {jQuery}
		 */
		getImageEl : function() {
			return this.$imgEl || null;
		},


		/**
		 * Loads the image, and then calls the {@link #onImageLoad} callback.
		 *
		 * @method loadImage
		 * @param {String} src The src for the image to show.
		 */
		loadImage : function( src ) {
			// Mark any old image(s) for removal. They will be removed when the new image loads.
			this.$oldImage = this.$imgEl;
			
			// Create a new image element
			this.$imgEl = $( '<img style="position: absolute; margin: 0; padding: 0; border: none; z-index: -999999;" />' )
				.bind( 'load error', $.proxy( this.onImageLoad, this ) )
				.appendTo( this.$fillmoreEl );
							
			this.$imgEl.attr( "src", src ); // Hack for IE img onload event
		},
		
		
		/**
		 * Method that is called when the image is loaded.
		 *
		 * @private
		 * @method onImageLoad
		 * @param {jQuery.Event} evt
		 */
		onImageLoad : function( evt ) {
			var img = evt.target,
				$imageEl = this.getImageEl();
			
			// If the image that has loaded is not the current image (the latest image), simply return out. 
			// We will "throw away" this image, as a new one is currently loading. This fixes a weird issue
			// where the fadeIn() method's callback will continually be called if a new image is requested
			// while one or more old ones are still loading.
			if( img !== $imageEl[ 0 ] ) {
				return;
			}

			// Remove the old image (if it exists)
			if( this.$oldImage ) {
				this.$oldImage.remove();
				this.$oldImage = null;
			}
			
			$.Fillmore.prototype.onImageLoad.apply( this, arguments );
			
			// Now, set the initial size
			this.resize();
		},
		
		
		/**
		 * Resizes the background image to the proper size, and fixes its position based on the container size.
		 * 
		 * @method resize
		 */
		resize : function() {
			if( this.$imgEl && this.imageLoaded ) {  // make sure the image has been created and loaded, in case of a resize that happens too early
				try {
					var sizeAndOffsets = this.calculateStretchedSizeAndOffsets();
					
					var bgCSS = { 
						left: "-" + sizeAndOffsets.offsetLeft + "px",
						top: "-" + sizeAndOffsets.offsetTop + "px"
					};
					
					// Update the elements
					this.$fillmoreEl.width( sizeAndOffsets.stretchedWidth ).height( sizeAndOffsets.stretchedHeight );
					this.$imgEl.width( sizeAndOffsets.stretchedWidth ).height( sizeAndOffsets.stretchedHeight ).css( bgCSS );
					
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
			// Remove the window resize handler
			$( window ).unbind( 'resize', this.resizeProxy );
			
			$.Fillmore.prototype.destroy.apply( this, arguments );
		}
		
	} );
	
})( jQuery );