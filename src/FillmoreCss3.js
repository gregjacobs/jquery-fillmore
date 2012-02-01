/**
 * @class $.FillmoreCss3
 * @extends $.Fillmore
 * 
 * CSS3 background-size:cover implementation of Fillmore. Used when CSS3 is available.
 */
/*global jQuery */
(function( $ ) {
	
	/**
	 * Creates a new FillmoreCss3 instance.
	 * 
	 * @constructor
	 * @param {HTMLElement/jquery} containerEl The container element where a fillmore'd image should be placed.
	 */
	$.FillmoreCss3 = function( containerEl ) {
		$.Fillmore.apply( this, arguments );
	};
	
	
	$.extend( $.FillmoreCss3.prototype, $.Fillmore.prototype, {
		
		/**
		 * @private
		 * @property {jQuery} $imgEl
		 * 
		 * Will store the current image that is displayed when {@link #showImage} is called.
		 */
		$imgEl : null,
		
		
		// ---------------------------
		
		
		/**
		 * Extension of {@link $.Fillmore#createFillmoreEl createFillmoreEl} from the superclass, to 
		 * apply the necessary CSS properties needed for the CSS3 implementation.
		 *
		 * @protected
		 * @method createFillmoreEl
		 * @return {jQuery}
		 */
		createFillmoreEl : function() {
			$.Fillmore.prototype.createFillmoreEl.apply( this, arguments );
	
			this.$fillmoreEl.css( {
				'background-repeat' : 'no-repeat',
				'background-size' : 'cover'
			} );
		},
		
		
		/**
		 * Extension of {@link $.Fillmore#updateSettings}, to update the {@link #$fillmoreEl} with any
		 * new focusX and focusY settings.
		 *
		 * @method updateSettings
		 * @property {Object} settings An object (hash) of settings. See the readme file for settings.
		 */
		updateSettings : function( settings ) {
			$.Fillmore.prototype.updateSettings.apply( this, arguments );
			
			// Update the $fillmoreEl for any focusX/focusY changes
			this.$fillmoreEl.css( 'background-position', this.settings.focusX + '% ' + this.settings.focusY + '%' );
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
		 * Resizes the background image to the proper size, and fixes its position based on the container size.
		 * The CSS3 implementation implements a no-op for this, as the browser takes care of it.
		 * 
		 * @method resize
		 */
		resize : function() {},
	
	
		/**
		 * Loads the image, and then calls the {@link #onImageLoad} callback.
		 *
		 * @method loadImage
		 * @param {String} src The src for the image to show.
		 */
		loadImage : function( src ) {
			// Create a new image element, so we can execute the callback after the 'load' event.
			// This is used to preload the image, before applying it to the background of the $fillmore element,
			// and then calling the callback
			this.$imgEl = $( '<img />' )
				.bind( 'load error', $.proxy( this.onImageLoad, this ) );
							
			this.$imgEl.attr( "src", src ); // Hack for IE img onload event
		},
		
		
		/**
		 * Method that is called when the image is loaded, to apply the image to the background
		 * of the {@link #$fillmoreEl}.
		 *
		 * @protected
		 * @method onImageLoad
		 * @param {jQuery.Event} evt
		 */
		onImageLoad : function( evt ) {
			var src = this.$imgEl[ 0 ].src;
			this.$fillmoreEl.css( 'background-image', "url('" + src + "')" );
			
			$.Fillmore.prototype.onImageLoad.apply( this, arguments );
		}
		
	} );
	
})( jQuery );