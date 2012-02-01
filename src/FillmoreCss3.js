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
		this.init( containerEl );
	};
	
	
	$.extend( $.FillmoreCss3.prototype, $.Fillmore.prototype, {
		
		/**
		 * Retrieve the element that has the image as the background.
		 *
		 * @method getImageEl
		 * @return {jQuery}
		 */
		getImageEl : function() {
			return this.$fillmoreEl;
		},
		
		
		/**
		 * Creates the fillmoreEl, which acts as the outer container of the image.
		 *
		 * @method getImageEl
		 * @return {jQuery}
		 */
		createFillmoreEl : function() {
			$.Fillmore.prototype.createFillmoreEl.apply( this, arguments );
	
			this.getImageEl().css( {
				'background-position' : this.settings.focusX + '% ' + this.settings.focusY + '%',
				'background-repeat' : 'no-repeat',
				'background-size' : 'cover'
			} );
		},	
	
	
		/**
		 * Resizes the background image to the proper size, and fixes its position based on the container size.
		 * The CSS3 implementation implements a no-op for this, as the browser takes care of it.
		 * 
		 * @method resize
		 */
		resize : function() {},
	
	
		/**
		 * Initializes the Fillmore plugin on an element.
		 *
		 * @method showImage
		 * @param {String} src The src for the image to show.
		 * @param {Function} callback (optional) A callback to call when the image has loaded and faded in.
		 */
		showImage : function( src, callback ) {
			$.Fillmore.prototype.showImage.apply( this, arguments );
	
			this.createFillmoreEl();
	
			// create an Image object so we can execute the callback after the 'load' event
			var img = new Image(),
				self = this;
			
			img.onload = img.onerror = $.proxy( function( e ) {
				this.getImageEl().css( {
					'background-image' : "url('" + src + "')"
				} );
	
				this.onImageLoaded( e, callback, src );
			}, this );
			
			img.src = src;
		},
	
	
		/**
		 * Removes the background image properties from the selected elements.
		 *
		 * @method destroy
		 */
		destroy : function() {
			this.getImageEl().css( {
				'background-image' : '',
				'background-position' : '',
				'background-repeat' : '',
				'background-size' : ''
			} );
		}
	
	} );
	
})( jQuery );