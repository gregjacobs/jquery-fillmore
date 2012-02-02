/*!
 * jQuery Fillmore
 * Version 1.0.0
 * https://github.com/gregjacobs/jquery-fillmore
 *
 * Add a dynamically-resized background image to any element
 *
 * Copyright (c) 2012 Gregory Jacobs with Aidan Feldman (jux.com)
 * Dual licensed under the MIT and GPL licenses.
 */

/**
 * @abstract
 * @class $.Fillmore
 * 
 * Main Fillmore class, which gives a single element a fillmore'd background.
 */
/*global window, jQuery */
(function( $ ) {
	
	/**
	 * Creates a new Fillmore instance.
	 * 
	 * @constructor
	 * @param {HTMLElement/jquery} containerEl The container element where a fillmore'd image should be placed.
	 */
	$.Fillmore = function( containerEl ) {
		this.init( containerEl );
	};
	
	
	// Static properties
	
	/**
	 * @static
	 * @property {Object} defaultSettings
	 * 
	 * The default settings used when not overridden by the user.
	 */
	$.Fillmore.defaultSettings = {
		src      : null, // The src for the image
		focusX   : 50,   // Focus position from left - Number between 1 and 100
		focusY   : 50,   // Focus position from top - Number between 1 and 100
		speed    : 0,    // fadeIn speed for background after image loads (e.g. "fast" or 500)
		
		onImageLoad    : undefined,
		onImageVisible : undefined,
		callback       : undefined
	};
	
	
	// Use a tiny custom built Modernizr to determine a few features for the 'useCss3' property (below)
	/* Modernizr 2.0.6 (Custom Build) | MIT & BSD
	 * Build: http://www.modernizr.com/download/#-backgroundsize-touch-teststyles-testprop-testallprops-prefixes-domprefixes
	 */
	var Modernizr = function(a,b,c){function B(a,b){var c=a.charAt(0).toUpperCase()+a.substr(1),d=(a+" "+n.join(c+" ")+c).split(" ");return A(d,b)}function A(a,b){for(var d in a)if(j[a[d]]!==c)return b=="pfx"?a[d]:!0;return!1}function z(a,b){return!!~(""+a).indexOf(b)}function y(a,b){return typeof a===b}function x(a,b){return w(m.join(a+";")+(b||""))}function w(a){j.cssText=a}var d="2.0.6",e={},f=b.documentElement,g=b.head||b.getElementsByTagName("head")[0],h="modernizr",i=b.createElement(h),j=i.style,k,l=Object.prototype.toString,m=" -webkit- -moz- -o- -ms- -khtml- ".split(" "),n="Webkit Moz O ms Khtml".split(" "),o={},p={},q={},r=[],s=function(a,c,d,e){var g,i,j,k=b.createElement("div");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),k.appendChild(j);g=["&shy;","<style>",a,"</style>"].join(""),k.id=h,k.innerHTML+=g,f.appendChild(k),i=c(k,a),k.parentNode.removeChild(k);return!!i},t,u={}.hasOwnProperty,v;!y(u,c)&&!y(u.call,c)?v=function(a,b){return u.call(a,b)}:v=function(a,b){return b in a&&y(a.constructor.prototype[b],c)};var C=function(c,d){var f=c.join(""),g=d.length;s(f,function(c,d){var f=b.styleSheets[b.styleSheets.length-1],h=f.cssRules&&f.cssRules[0]?f.cssRules[0].cssText:f.cssText||"",i=c.childNodes,j={};while(g--)j[i[g].id]=i[g];e.touch="ontouchstart"in a||j.touch.offsetTop===9},g,d)}([,["@media (",m.join("touch-enabled),("),h,")","{#touch{top:9px;position:absolute}}"].join("")],[,"touch"]);o.touch=function(){return e.touch},o.backgroundsize=function(){return B("backgroundSize")};for(var D in o)v(o,D)&&(t=D.toLowerCase(),e[t]=o[D](),r.push((e[t]?"":"no-")+t));w(""),i=k=null,e._version=d,e._prefixes=m,e._domPrefixes=n,e.testProp=function(a){return A([a])},e.testAllProps=B,e.testStyles=s;return e}(this,this.document);
	
	
	/**
	 * @static
	 * @property {Boolean} useCss3
	 * 
	 * A flag for whether or not we can use the CSS3 background-size:cover implementation. 
	 * 
	 * Note: iOS4's background-size:cover implementation is broken, so we can't use it in that case, even if the
	 * browser supposedly supports it
	 */
	$.Fillmore.useCss3 = Modernizr.backgroundsize && !( Modernizr.touch && window.navigator.userAgent.match( /OS 4_/ ) );
	
	
	
	// Instance properties/methods
	$.extend( $.Fillmore.prototype, {
	
		/**
		 * @protected
		 * @property {Object} settings
		 * 
		 * The configured settings (options) for the instance. This is initialized
		 * to just the default settings, and is updated via the {@link #updateSettings} method.
		 */
		
		/**
		 * @protected
		 * @property {jQuery} $containerEl
		 * 
		 * The container element that is having a fillmore'd image applied to it.
		 */
		
		/**
		 * @private
		 * @property {jQuery} $containerSizingEl
		 * 
		 * The element to use to size the fillmore'd element. This is in most cases the {@link #$containerEl} itself, but
		 * in the case that the document body is being used, it becomes either the document object (for iOS), or the window
		 * object for all other OS's.
		 */
	
		/**
		 * @protected
		 * @property {jQuery} $fillmoreEl
		 * 
		 * The element which will hold the fillmore'd image.
		 */
	
		/**
		 * @protected
		 * @property {String} fillmoreElPosition
		 * 
		 * CSS position for the fillmoreEl.
		 */
		fillmoreElPosition : 'absolute',
	
		/**
		 * @protected
		 * @property {Boolean} imageLoaded
		 * 
		 * Flag to determine if the image is fully loaded.
		 */
		imageLoaded : false,
	
		/**
		 * @protected
		 * @property {Boolean} imageVisible
		 * 
		 * Flag to determine if the image is fully loaded, **and** has been faded in.
		 */
		imageVisible : false,
		
		
		// -----------------------------
		
		
		/**
		 * Initializes the special Fillmore element, which is nested inside the containerEl and acts as
		 * the container of the image.
		 * 
		 * This method modifies certain CSS properties of the container element if it needs to. This includes:
		 * 
		 * - `position` : to give the container element a positioning context if it doesn't have one
		 * - `z-index` : to give the container element a stacking context if it doesn't have one
		 * - `background` : to make the background of the container element transparent, if it's not already.
		 * 
		 * Note that the above properties are applied for both the CSS3 and ImageStretch implementations, even though
		 * the CSS3 implementation doesn't need the `position` and `z-index` to be set. It is done this way so that you
		 * expect it and can work around it if need be, because users that are using older browsers will need those properties 
		 * applied (although it is unlikely that you will need to do anything in most cases).
		 *
		 * @method init
		 * @property {HTMLElement/jquery} containerEl The container element where a fillmore'd image should be placed.
		 */
		init : function( containerEl ) {
			// Start with the default settings (need a copy)
			this.settings = $.extend( {}, $.Fillmore.defaultSettings );
			
			var $containerEl = this.$containerEl = $( containerEl );
	
			// Make sure the container element has a transparent background, so we can see the stretched image
			$containerEl.css( 'background', 'transparent' );
			
			if( $containerEl.is( 'body' ) ) {
				this.fillmoreElPosition = 'fixed';
				
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
			
			// Find the element that we should size off of. This is different than the actual $containerEl only if the
			// $containerEl is the document body
			if( this.$containerEl.is( 'body' ) ) {
				this.$containerSizingEl = ( 'onorientationchange' in window ) ? $( document ) : $( window ); // hack to acccount for iOS position:fixed shortcomings
			} else {
				this.$containerSizingEl = this.$containerEl;
			}
			
			this.createFillmoreEl();
		},
		
		
		/**
		 * Creates the fillmoreEl, which acts as the outer container of the image.
		 *
		 * @protected
		 * @method createFillmoreEl
		 * @return {jQuery}
		 */
		createFillmoreEl : function() {
			// The div element that will be placed inside the container, with the image placed inside of it
			this.$fillmoreEl = $( '<div style="left: 0; top: 0; position: ' + this.fillmoreElPosition + '; overflow: hidden; z-index: -999999; margin: 0; padding: 0; height: 100%; width: 100%;" />' )
				.appendTo( this.$containerEl );
		},
		
		
		/**
		 * Updates the settings of the instance with any new settings supplied.
		 *
		 * @method updateSettings
		 * @property {Object} settings An object (hash) of settings. See the readme file for settings.
		 */
		updateSettings : function( settings ) {
			this.settings = $.extend( this.settings, settings );
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
		 * Abstract method to retrieve the element that has the image attached.
		 *
		 * @abstract
		 * @protected
		 * @method getImageEl
		 * @return {jQuery} The image element, wrapped in a jQuery object (wrapped set)
		 */
		getImageEl : function() {
			throw new Error( "getImageEl() must be implemented in subclass" );
		},
	
		
		/**
		 * Retrieves the size of the loaded image, once it has loaded. If this method is called
		 * before the image has loaded, the method will return null.
		 * 
		 * @method getImageSize
		 * @return {Object} An object (hashmap) with properties `width` and `height`, or null if the
		 *   image is not yet loaded.
		 */
		getImageSize : function() {
			if( !this.imageLoaded ) {
				return null;
				
			} else {
				var imageEl = this.getImageEl()[ 0 ];
				return {
					width: imageEl.width,
					height: imageEl.height
				};	
			}
		},
		
		
		/**
		 * Calculates the stretched size and offset of where the top/left of the image should be in relation to the top/left of the viewable 
		 * area. Because the image is "stretched" behind the viewable area, its top/left position usually exists above and to the left
		 * of the viewable area itself. Offsets are returned as positive numbers (even though they will most likely be used to apply
		 * negative offsets to the image).
		 * 
		 * This method returns the stretched size and offsets based on the image's original size, the viewable area size 
		 * (i.e. the {@link #$containerEl containerEl's} size), and the focusX and focusY points (settings).
		 * 
		 * @protected
		 * @method calculateStretchedSizeAndOffsets
		 * @return {Object} Unless the image is not loaded (in which case, this method returns null), returns an object with the 
		 *   following properties:
		 * @return {Number} return.offsetLeft The number of pixels from the left side of the image to the left side of the viewable area.
		 *   Will be 0 if the left side of the stretched image is to be flush with the left side of the container, or a positive number
		 *   for how far away it should be.
		 * @return {Number} return.offsetTop The number of pixels from the top of the image to the top of the viewable area.
		 *   Will be 0 if the top of the stretched image is to be flush with the top of the container, or a positive number
		 *   for how far away it should be.
		 * @return {Number} return.stretchedWidth The width that the background image should be, to stretch over the container.
		 * @return {Number} return.stretchedHeight The height that the background image should be, to stretch over the container.
		 */
		calculateStretchedSizeAndOffsets : function() {
			var $imageEl = this.getImageEl(),
			    imgEl = $imageEl[ 0 ];
			
			// Store the ratio of the image's width to height. This is for the offsets calculation.
			$imageEl.css( { width: "auto", height: "auto" } );  // make sure the image element doesn't have any explicit width/height for the measurement (which may be added if it has been resized before)
			
			var imgWidth = imgEl.width || $imageEl.width(),
				imgHeight = imgEl.height || $imageEl.height(),
				imgRatio = imgWidth / imgHeight,
				
				settings = this.settings,
			    $containerEl = this.$containerEl,
			    $containerSizingEl = this.$containerSizingEl,
			    containerHeight = $containerSizingEl.outerHeight() || $containerSizingEl.height(),  // outerHeight() for regular elements, and height() for window (which returns null for outerHeight())
			    containerWidth = $containerSizingEl.outerWidth() || $containerSizingEl.width(),	    // outerWidth() for regular elements, and width() for window (which returns null for outerWidth())
				
				offsetLeft = 0,
				offsetTop = 0,
				stretchedWidth = containerWidth,
				stretchedHeight = stretchedWidth / imgRatio;
			
			// Make adjustments based on image ratio
			// Note: Offset code inspired by Peter Baker (http://ptrbkr.com/). Thanks, Peter!
			if( stretchedHeight >= containerHeight ) {
				offsetTop = ( stretchedHeight - containerHeight ) * this.settings.focusY / 100;
			} else {
				stretchedHeight = containerHeight;
				stretchedWidth = stretchedHeight * imgRatio;
				offsetLeft = ( stretchedWidth - containerWidth ) * this.settings.focusX / 100;
			}
			
			return {
				offsetLeft      : offsetLeft,
				offsetTop       : offsetTop,
				stretchedWidth  : stretchedWidth,
				stretchedHeight : stretchedHeight
			};
		},
		
		
		/**
		 * Retrives the area of the image that is currently "viewable". Returns the top/left
		 * offset from the image to the top/left of the viewable area, and returns the height/width
		 * of the viewable area as well.
		 * 
		 * @method getViewableImageArea
		 * @return {Object} An object (hashmap) with the following properties (unless the image is not currently loaded, in 
		 * 	  which case this method returns null):
		 * @return {Number} return.width The number of pixels that represent the width of the viewable area.
		 * @return {Number} return.height The number of pixels that represent the height of the viewable area.
		 * @return {Number} return.offsetLeft The number of pixels from the left side of the image to the left side of the viewable area.
		 * @return {Number} return.offsetTop The number of pixels from the top of the image to the top of the viewable area.
		 * @return {Number} return.stretchedWidth The width that the background image has been stretched to be, to stretch over the container.
		 * @return {Number} return.stretchedHeight The height that the background image has been stretched to be, to stretch over the container.
		 */
		getViewableImageArea : function() {
			if( !this.imageLoaded ) {
				return null;
				
			} else {
				var $containerEl = this.$containerEl,
				    imageSizeAndOffsets = this.calculateStretchedSizeAndOffsets();
				
				return {
					width           : $containerEl.innerWidth(),
					height          : $containerEl.innerHeight(),
					offsetLeft      : imageSizeAndOffsets.offsetLeft,
					offsetTop       : imageSizeAndOffsets.offsetTop,
					stretchedWidth  : imageSizeAndOffsets.stretchedWidth,
					stretchedHeight : imageSizeAndOffsets.stretchedHeight
				};
			}
		},
	
	
		/**
		 * Method to initialize the Fillmore plugin on an element.
		 *
		 * @method showImage
		 * @param {String} src The src for the image to show.
		 */
		showImage : function( src ) {
			this.imageLoaded = false;
			this.imageVisible = false;
			
			// Call hook method for subclasses
			this.loadImage( src );
		},
		
		
		/**
		 * Implementation-specific image loading method, which must be implemented in a subclass.
		 * This method should load the image how it wants, and then call the {@link #onImageLoad}
		 * method when the image has finished loading (or has failed to load). 
		 * 
		 * @abstract
		 * @protected
		 * @method loadImage
		 */
		loadImage : function() {
			throw new Error( "loadImage() must be implemented in subclass" );
		},
		
	
		/**
		 * Deprecated, use {@link #imageIsVisible} instead. This method is simply an alias to {@link #imageIsVisible}
		 * at this time.
		 * 
		 * @deprecated 1.3 Replaced by {@link #imageIsVisible}.
		 * @method isLoaded
		 * @return {Boolean} True if the image is fully loaded and faded in. False otherwise.
		 */
		isLoaded : function() {
			return this.imageIsVisible();
		},
		
		
		/**
		 * Determines if the image is currently loaded. This relates to the last image that was
		 * requested to be loaded. So if there is an old image loaded, and a new one is requested
		 * by calling fillmore again but has not yet been downloaded by the browser, this will return
		 * false until the new image comes in.
		 * 
		 * @method imageIsLoaded
		 * @return {Boolean} True if the latest image requested is loaded, false otherwise.
		 */
		imageIsLoaded : function() {
			return this.imageLoaded;
		},
		
		
		/**
		 * Determines if the image is loaded, *and* visible (i.e. has been faded in).
		 * 
		 * @method imageIsVisible
		 * @return {Boolean} True if the image is both loaded, *and* visible. False otherwise.
		 */
		imageIsVisible : function() {
			return this.imageVisible;
		},
	
	
		/**
		 * Resizes the background image to the proper size, and fixes its position based on the container size.
		 * 
		 * @abstract
		 * @method resize
		 */
		resize : function() {
			throw new Error( "resize() must be implemented in subclass" );
		},
		
		
		// ---------------------------
		
		
		/**
		 * Method that is called when the image is loaded.
		 *
		 * @protected
		 * @method onImageLoad
		 * @param {jQuery.Event} evt
		 */
		onImageLoad : function( evt ) {			
			this.imageLoaded = true;
			
			// Call the onImageLoad callback, if there is one
			var onImageLoad = this.settings.onImageLoad;
			if( typeof onImageLoad === 'function' ) {
				onImageLoad();
			}
			
			this.$fillmoreEl
				.hide()
				.fadeIn( this.settings.speed, $.proxy( this.onImageVisible, this ) );
		},
		
		
		/**
		 * Method that is called when the image becomes fully visible.
		 *
		 * @private
		 * @method onImageVisible
		 * @param {Function} callback (optional) A callback to call when the image has loaded and faded in.
		 *   This is called before the {@link #settings} `onImageVisible` callback is called.
		 */
		onImageVisible : function( callback ) {
			this.imageVisible = true;
			
			var settings = this.settings,
			    onImageVisible = settings.onImageVisible || settings.callback;  // 'callback' is legacy
			    
			if( typeof onImageVisible === "function" ) {
				onImageVisible();
			}
		},
		
		
		// ------------------------------
		
		
		/**
		 * Remove Fillmore from the target element.
		 *
		 * @abstract
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
		}
	
	} );
	
})( jQuery );