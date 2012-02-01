#!/bin/bash

# Concatenate the files
cat src/Fillmore.js > jquery.fillmore.js
cat src/FillmoreCss3.js >> jquery.fillmore.js
cat src/FillmoreImageStretch.js >> jquery.fillmore.js
cat src/jQueryAdapter.js >> jquery.fillmore.js

# Create minified file
java -jar yuicompressor/yuicompressor-2.4.6.jar jquery.fillmore.js -o jquery.fillmore.min.js