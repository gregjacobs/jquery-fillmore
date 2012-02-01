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
		callback : undefined
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
		 * @property {Boolean} loaded
		 * 
		 * Flag to determine if the image is fully loaded, <b>and</b> has been faded in.
		 */
		loaded : false,
	
		/**
		 * @protected
		 * @property {jQuery} $deletable
		 * 
		 * DOM elements to be deleted once the image has faded in.
		 */
		
		
		/**
		 * Initializes the special Fillmore element, which is nested inside the containerEl and acts as
		 * the container of the image.
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
			
			
			this.createFillmoreEl();
		},
	
	
		/**
		 * Creates the fillmoreEl, which acts as the outer container of the image.
		 *
		 * @method getImageEl
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
		 * @property {Object} settings An object (hash) of settings. Current options include: 'focusX' (Number), 'focusY' (Number) and 'speed' (Int).  'centeredX' (Boolean) and 'centeredY' (Boolean) are deprecated.
		 */
		updateSettings : function( settings ) {
			this.settings = $.extend( this.settings, settings );
	
			if( settings.centeredX ) {
				this.settings.focusX = 50;
			}
			if( settings.centeredY ) {
				this.settings.focusY = 50;
			}
		},
	
	
		/**
		 * Abstract method to retrieve the element that has the image attached.
		 *
		 * @abstract
		 * @method getImageEl
		 * @return {jQuery}
		 */
		getImageEl : function() {
			throw new Error( "getImageEl() must be implemented by subclass" );
		},
	
		
		/**
		 * Retrieves the size of the loaded image, once it has loaded. If this method is called
		 * before the image has loaded, the sizes will be returned as undefined.
		 * 
		 * @method getImageSize
		 * @return {Object} An object (hashmap) with properties `width` and `height`.
		 */
		getImageSize : function() {
			if( this.loaded ) {
				var imageEl = this.getImageEl()[ 0 ];
				return {
					width: imageEl.width,
					height: imageEl.height
				};
				
			} else {
				return { width: undefined, height: undefined }
			}
		},
	
	
		/**
		 * Method to initialize the Fillmore plugin on an element.
		 *
		 * @method showImage
		 * @param {String} src The src for the image to show.
		 * @param {Function} callback (optional) A callback to call when the image has loaded and faded in.
		 */
		showImage : function( src, callback ) {
			// Mark any old image(s) for removal. They will be removed when the new image loads.
			this.$deletable = this.getImageEl();
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
			this.getImageEl()
				.hide()
				.fadeIn( this.settings.speed, $.proxy( function(){
					this.onImageVisible( callback );
				}, this ) );
		},
		
		
		/**
		 * Method that is called when the image becomes fully visible.
		 *
		 * @private
		 * @method onImageVisible
		 * @param {Function} callback (optional) A callback to call when the image has loaded and faded in.
		 */
		onImageVisible : function( callback ) {
			this.loaded = true;
	
			// Remove the old images (if any exist)
			if( this.$deletable ) {
				this.$deletable.remove();
				this.$deletable = null;
			}
			
			if( typeof callback === "function" ) {
				callback();
			}
		},
	
	
		/**
		 * Resizes the background image to the proper size, and fixes its position based on the container size.
		 * 
		 * @abstract
		 * @method resize
		 */
		resize : function() {
			throw new Error( "resize() must be implemented by subclass" );
		},
	
	
		/**
		 * Determines if the image is currently loaded, and has been faded in.
		 * 
		 * @method isLoaded
		 * @return {Boolean} True if the image is fully loaded and faded in. False otherwise.
		 */
		isLoaded : function() {
			return this.loaded;
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
		 * Abstract method to remove the Fillmore from the selected elements.
		 *
		 * @abstract
		 * @method destroy
		 */
		destroy : function() {
			throw new Error( "destroy() must be implemented by subclass" );
		}
	
	} );
	
})( jQuery );