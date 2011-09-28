/*
 * jQuery Fillmore
 * Version 0.1.0
 * https://github.com/Gjslick/jquery-fillmore
 *
 * Add a dynamically-resized background image to any element
 *
 * Copyright (c) 2011 Gregory Jacobs (jux.com)
 * Dual licensed under the MIT and GPL licenses.
 */

(function($) {
    
    var defaultSettings = {
        centeredX: true,         // Should we center the image on the X axis?
        centeredY: true,         // Should we center the image on the Y axis?
        speed: 0                 // fadeIn speed for background after image loads (e.g. "fast" or 500)
    };
    
    
    /**
     * @private
     * @class Fillmore
     * 
     * Fillmore class for making an instance on every element that is to have a fillmoreed background.
     * The constructor initializes the properties and elements that the plugin will use.
     *
     * @constructor
     * @property {HTMLElement|jquery} containerEl The container element where a fillmoreed image should be placed.
     */
    var Fillmore = function( containerEl ) {
        var fillmoreElPosition = 'absolute';  // will be set to fixed if using the body element as the container
        
        
        /**
         * The z-index to use for the {@link #$fillmoreEl}. This is set to -1 for regular elements, and -999999 for the body element.
         *
         * @private
         * @property zIndex
         * @type Int
         */
        this.zIndex = -1;  // -1 for regular elements, -999999 for body element
        
        /**
         * The container element that is having a fillmoreed image applied to it.
         * 
         * @private
         * @property $containerEl
         * @type jQuery
         */
        this.$containerEl = $( containerEl )
            .css( {
               position: 'relative',      // make sure the container has a positioning context, so we can position the $fillmoreEl inside it
               background: 'transparent' 
            } );
            
        
        /**
         * The element to use to size the fillmoreed element. This is in most cases the {@link #$containerEl} itself, but
         * in the case that the document body is being used, it becomes either the document object (for iOS), or the window
         * object for all other OS's.
         *
         * @private
         * @property $containerSizingEl
         * @type jQuery
         */
        this.$containerSizingEl = this.$containerEl;
        if( this.$containerSizingEl.is( 'body' ) ) {
            this.$containerSizingEl = ( 'onorientationchange' in window ) ? $( document ) : $( window ); // hack to acccount for iOS position:fixed shortcomings
            fillmoreElPosition = 'fixed';
            this.zIndex = -999999;
        } else {
            this.$containerEl.css( 'overflow', 'hidden' );
        }
        
        /**
         * The configured settings (options) for the instance. This is initialized
         * to just the default settings, and is updated via the {@link #updateSettings} method.
         * 
         * @private
         * @property settings
         * @type Object
         */
        this.settings = $.extend( {}, defaultSettings );
        
        /**
         * The element which will hold the fillmoreed image.
         * 
         * @private
         * @property $fillmoreEl
         * @type jQuery
         */
        this.$fillmoreEl = $( '<div style="left: 0; top: 0; position: ' + fillmoreElPosition + '; overflow: hidden; z-index: ' + this.zIndex + '; margin: 0; padding: 0; height: 100%; width: 100%;" />' )
            .appendTo( this.$containerEl );
        
        /**
         * Will store the current image that is displayed when {@link #showImage} is called.
         *
         * @private
         * @property $img
         * @type jQuery
         */
        this.$img = null;
        
        /**
         * Stores the image ratio of the current image.
         *
         * @private
         * @property imgRatio
         * @type Number
         */
        this.imgRatio = null;
        
        
        // Add a handler to adjust the background size when the window is resized or orientation has changed (iOS)
        $( window ).resize( $.proxy( this.adjustBG, this ) );
    };
    
    
    Fillmore.prototype = {
        constructor : Fillmore,  // fix constructor property
        
        
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
            this.$img = $( '<img style="position: absolute; display: none; margin: 0; padding: 0; border: none; z-index: ' + this.zIndex + ';" />' )
                .bind( 'load', $.proxy( function( evt ) { this.onImageLoaded( evt, callback ); }, this ) )
                .appendTo( this.$fillmoreEl );
                            
            this.$img.attr( "src", src ); // Hack for IE img onload event
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
            
            this.$img.css( { width: "auto", height: "auto" } );
            
            var imgWidth = img.width || this.$img.width(),
                imgHeight = img.height || this.$img.height();
            
            // Store the image ratio
            this.imgRatio = imgWidth / imgHeight;
            
            this.adjustBG();
            
            this.$img.fadeIn( this.settings.speed, function() {
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
            if( this.$img ) {  // make sure the image has been created, in case of a resize that happens too early
                try {
                    var settings = this.settings,
                        $containerEl = this.$containerEl,
                        $containerSizingEl = this.$containerSizingEl,
                        containerHeight = $containerSizingEl.outerHeight() || $containerSizingEl.height(),  // outerHeight() for regular elements, and height() for window (which returns null for outerHeight())
                        containerWidth = $containerSizingEl.outerWidth() || $containerSizingEl.width(),     // outerWidth() for regular elements, and width() for window (which returns null for outerWidth())
                        
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
                    this.$img.width( bgWidth ).height( bgHeight ).css( bgCSS );
                    
                } catch( err ) {
                    // IE7 seems to trigger _adjustBG before the image is loaded.
                    // This try/catch block is a hack to let it fail gracefully.
                }
            }
        }
    };
    
    
    // --------------------------
    
    
    // jQuery Plugin Code
    $.fn.fillmore = function( src, settings, callback ) {
        return this.each( function( idx, el ) {
            // Create an instance on the element if there is none yet
            var $el = $( el ),
                fillmore = $el.data( 'fillmore' );
            
            if( !fillmore ) { // no instance for the element yet
                fillmore = new Fillmore( el );
                $el.data( 'fillmore', fillmore );
            }
            
            
            fillmore.updateSettings( settings );
            fillmore.showImage( src, callback );
        } );
    };
    
    
    // Static jQuery method, to maintain old behavior. This automatically attaches to the body element.
    $.fillmore = function( src, settings, callback ) {
        $( document ).ready( function() {
            $( 'body' ).fillmore( src, settings, callback );
        } );
    };
  
})(jQuery);
