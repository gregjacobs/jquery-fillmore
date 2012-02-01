:: Concatenate the files
type src\Fillmore.js > jquery.fillmore.js
type src\FillmoreCss3.js >> jquery.fillmore.js
type src\FillmoreImageStretch.js >> jquery.fillmore.js
type src\jQueryAdapter.js >> jquery.fillmore.js

:: Create minified file
java -jar yuicompressor\yuicompressor-2.4.6.jar jquery.fillmore.js -o jquery.fillmore.min.js