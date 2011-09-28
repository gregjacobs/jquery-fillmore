/*
 * jQuery Backstretch
 * Version 1.2.2
 * http://srobbin.com/jquery-plugins/jquery-backstretch/
 *
 * Add a dynamically-resized background image to the page
 *
 * Copyright (c) 2011 Scott Robbin (srobbin.com)
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
     * @class Backstretch
     * 
     * Backstretch class for making an instance on every element that is to have a backstretched background.
     * The constructor initializes the properties and elements that the plugin will use.
     *
     * @constructor
     * @property {HTMLElement|jquery} containerEl The container element where a backstretched image should be placed.
     */
    var Backstretch = function( containerEl ) {
        var backstretchElPosition = 'absolute';  // will be set to fixed if using the body element as the container
        
        
        /**
         * The z-index to use for the {@link #$backstretchEl}. This is set to -1 for regular elements, and -999999 for the body element.
         *
         * @private
         * @property zIndex
         * @type Int
         */
        this.zIndex = -1;  // -1 for regular elements, -999999 for body element
        
        /**
         * The container element that is having a backstretched image applied to it.
         * 
         * @private
         * @property $containerEl
         * @type jQuery
         */
        this.$containerEl = $( containerEl )
            .css( {
               position: 'relative',      // make sure the container has a positioning context, so we can position the $backstretchEl inside it
               background: 'transparent' 
            } );
            
        
        /**
         * The element to use to size the backstretched element. This is in most cases the {@link #$containerEl} itself, but
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
            backstretchElPosition = 'fixed';
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
         * The element which will hold the backstretched image.
         * 
         * @private
         * @property $backstretchEl
         * @type jQuery
         */
        this.$backstretchEl = $( '<div style="left: 0; top: 0; position: ' + backstretchElPosition + '; overflow: hidden; z-index: ' + this.zIndex + '; margin: 0; padding: 0; height: 100%; width: 100%;" />' )
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
    
    
    Backstretch.prototype = {
        constructor : Backstretch,  // fix constructor property
        
        
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
         * Initializes the Backstretch plugin on an element.
         *
         * @method showImage
         * @param {String} src The src for the image to show.
         * @param {Function} callback (optional) A callback to call when the image has loaded and faded in.
         */
        showImage : function( src, callback ) {
            // Mark any old image(s) for removal. They will be removed when the new image loads.
            this.$backstretchEl.find( 'img' ).addClass( 'deletable' );
            
            
            // Create a new image element
            this.$img = $( '<img style="position: absolute; display: none; margin: 0; padding: 0; border: none; z-index: ' + this.zIndex + ';" />' )
                .bind( 'load', $.proxy( function( evt ) { this.onImageLoaded( evt, callback ); }, this ) )
                .appendTo( this.$backstretchEl );
                            
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
                $backstretchEl = this.$backstretchEl;
            
            this.$img.css( { width: "auto", height: "auto" } );
            
            var imgWidth = img.width || this.$img.width(),
                imgHeight = img.height || this.$img.height();
            
            // Store the image ratio
            this.imgRatio = imgWidth / imgHeight;
            
            this.adjustBG();
            
            this.$img.fadeIn( this.settings.speed, function() {
                // Remove the old images (if any exist), and remove them
                $backstretchEl.find( 'img.deletable' ).remove();
                
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
                    this.$backstretchEl.width( bgWidth ).height( bgHeight );
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
    $.fn.backstretch = function( src, settings, callback ) {
        return this.each( function( idx, el ) {
            // Create an instance on the element if there is none yet
            var $el = $( el ),
                backstretch = $el.data( 'backstretch' );
            
            if( !backstretch ) { // no instance for the element yet
                backstretch = new Backstretch( el );
                $el.data( 'backstretch', backstretch );
            }
            
            
            backstretch.updateSettings( settings );
            backstretch.showImage( src, callback );
        } );
    };
    
    
    // Static jQuery method, to maintain old behavior. This automatically attaches to the body element.
    $.backstretch = function( src, settings, callback ) {
        $( document ).ready( function() {
            $( 'body' ).backstretch( src, settings, callback );
        } );
    };
  
})(jQuery);