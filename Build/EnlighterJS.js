/*!
---
name: EnlighterJS
description: Post Syntax Highlighter for MooTools - based on the famous Lighter.js

license: MIT-Style X11 License
version: 2.4
build: 1793fd3b665e16d572e7710e1864c25e/November 13 2014

authors:
  - Andi Dittrich (author of EnlighterJS)
  - Jose Prado (author of original Lighter.js)
  
download: https://github.com/AndiDittrich/EnlighterJS
website: http://enlighterjs.andidittrich.de/
demo: http://enlighterjs.andidittrich.de/Themes.html
  
requires:
  - Core/1.4.5

provides: [EnlighterJS]
...
*//*
---
name: EnlighterJS
description: Syntax Highlighter based on the famous Lighter.js

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - Core/1.4.5

provides: [EnlighterJS]
...
 */
var EnlighterJS = new Class({

	Implements : Options,

	options : {
		language : 'generic',
		theme : 'Enlighter',
		renderer: 'Block',
		indent : -1,
		forceTheme: false,
		rawButton: true,
		windowButton: true,
		infoButton: true,
		ampersandCleanup: true,
		rawcodeDoubleclick: false
	},

	// used renderer instance
	renderer: null,
	
	// used codeblock to highlight
	originalCodeblock: null,
	
	// used container to store highlighted code
	container: null,
	
	// lightning active ?
	isRendered: false,
	
	// language alias manager
	languageManager: null,

	// toggle raw code
	rawContentContainer: null,
	
	// rendered output span/ou/ul container
	output: null,
	

	/**
	 * @constructs
	 * @param {Element} originalCodeblock An Element containing code to highlight
	 * @param {Object} options The options object.
	 * @param {Element} container (optional) The output container - if not defined, the output will be injected after the originalCodeblock
	 */
	initialize : function(originalCodeblock, options, container) {
		this.setOptions(options);
		
		// create new language alias manager instance
		this.languageManager = new EnlighterJS.LanguageManager(options);
				
		// initialize renderer
		if (this.options.renderer == 'Inline'){
			this.renderer = new EnlighterJS.Renderer.InlineRenderer(options);
		}else{
			this.renderer = new EnlighterJS.Renderer.BlockRenderer(options);
		}
				
		// store codeblock element
		this.originalCodeblock = document.id(originalCodeblock);
		
		// store/create container
		if (container){
			this.container = document.id(container);
		}
	},

	/**
	 * Takes a codeblock and highlights the code inside of it using the
	 * stored parser/compilers. It reads the class name to figure out what
	 * language and theme to use for highlighting.
	 * 
	 * @return {EnlighterJS} The current EnlighterJS instance.
	 */
	enlight : function(enabled){
		// show highlighted sourcecode ?
		if (enabled){
			// get element language
			var rawLanguageName = this.originalCodeblock.get('data-enlighter-language');
			
			// ignore higlighting ?
			if (rawLanguageName == 'no-highlight'){
				return;
			}
			
			// hide original codeblock
			this.originalCodeblock.setStyle('display', 'none');
			
			// EnlighterJS exists so just toggle display.
			if (this.isRendered) {				
				this.container.setStyle('display', 'inherit');
				return this;
			}
			
			// get language name - use alias manager to check language string and validate
			var languageName = this.languageManager.getLanguage(rawLanguageName);
			
			// get theme name - use options as fallback
			var themeName = (this.options.forceTheme ? null : this.originalCodeblock.get('data-enlighter-theme')) || this.options.theme || 'Enlighter';
			
			// special lines to highlight ?
			var specialLines = new EnlighterJS.SpecialLineHighlighter(this.originalCodeblock.get('data-enlighter-highlight'), this.originalCodeblock.get('data-enlighter-lineoffset'));
			
			// Load language parser
			language = new EnlighterJS.Language[languageName](this.getRawCode(true));
			
			// compile tokens -> generate output
			this.output = this.renderer.render(language, specialLines, {
				lineOffset: (this.originalCodeblock.get('data-enlighter-lineoffset') || null),
				lineNumbers: this.originalCodeblock.get('data-enlighter-linenumbers')
			});
			
			// set class and id attributes.
			this.output.addClass(themeName.toLowerCase() + 'EnlighterJS').addClass('EnlighterJS');		
	
			// add wrapper ?
			if (this.options.renderer == 'Block'){
				// grab content into specific container or after original code block ?
				if (!this.container) {
					this.container = new Element('div');
					
					// put the highlighted code wrapper behind the original	
					this.container.inject(this.originalCodeblock, 'after');
				}
				
				// add wrapper class
				this.container.addClass('EnlighterJSWrapper').addClass(themeName.toLowerCase() + 'EnlighterJSWrapper');
				
				// add the highlighted code
				this.container.grab(this.output);
				
				// create raw content container
				this.rawContentContainer = new Element('pre', {
					text: this.getRawCode(false),
					styles: {
						'display': 'none'
					}
				});
				
				// add raw content container
				this.container.grab(this.rawContentContainer);
				
				// show raw code on double-click ?
				if (this.options.rawcodeDoubleclick){
					this.container.addEvent('dblclick', function(){
						this.toggleRawCode();
					}.bind(this));
				}
				
				// toolbar ?
				if (this.options.rawButton || this.options.windowButton || this.options.infoButton){
					this.container.grab(new EnlighterJS.UI.Toolbar(this));
				}
				
			// normal handling
			}else{
				// grab content into specific container or after original code block ?
				if (this.container) {
					this.container.grab(this.output);
					
				// just put the highlighted code behind the original	
				}else{
					this.output.inject(this.originalCodeblock, 'after');
					this.container = this.output;
				}
			}
			
			// set render flag
			this.isRendered = true;
			
		// disable highlighting	
		}else{
			// already highlighted ?
			if (this.isRendered) {
				this.originalCodeblock.setStyle('display', 'inherit');
				this.container.setStyle('display', 'none');
			}
		}

		return this;
	},
	
	/**
	 * Takes a codeblock and highlights the code inside. The original codeblock is set to invisible
	 * @DEPRECATED since v2.0 - this method will be removed in the future
	 * 
	 * @return {EnlighterJS} The current EnlighterJS instance.
	 */
	light : function(){
		return this.enlight(true);
	},
		
	/**
	 * Unlights a codeblock by hiding the enlighter element if present and re-displaying the original code.
	 * @DEPRECATED since v2.0 - this method will be removed in the future
	 * 
	 * @return {EnlighterJS} The current EnlighterJS instance.
	 */
	unlight : function() {
		return this.enlight(false);
	},

	/**
	 * Extracts the raw code from given codeblock
	 * @return {String} The plain-text code (raw)
	 */
	getRawCode: function(reindent) {
		// get the raw content
		var code = this.originalCodeblock.get('html');
		
		// remove empty lines at the beginning+end of the codeblock
		code = code.replace(/(^\s*\n|\n\s*$)/gi, '');
		
		// cleanup ampersand ?
		if (this.options.ampersandCleanup===true){
			code = code.replace(/&amp;/gim, '&');
		}
		
		// replace html escaped chars
		code = code.replace(/&lt;/gim, '<').replace(/&gt;/gim, '>').replace(/&nbsp;/gim, ' ');

		// replace tabs with spaces ?
		if (reindent === true){
			// get indent option value
			var newIndent = this.options.indent.toInt();
			
			// re-indent code if specified
			if (newIndent > -1){
				// match all tabs
				code = code.replace(/(\t*)/gim, function(match, p1, offset, string){
					// replace n tabs with n*newIndent spaces
					return (new Array(newIndent * p1.length + 1)).join(' ');
				});
			}
		}
		
		return code;
	},
	
	/**
	 * Hide/Show the RAW Code Container/Toggle Highlighted Code
	 */
	toggleRawCode: function(show){
		// initialization required!
		if (this.output == null){
			return;
		}
		
		// argument set ?
		if (typeof(show)!='boolean'){
			show = (this.rawContentContainer.getStyle('display') == 'none');
		}
		
		// toggle container visibility
		if (show){
			this.output.setStyle('display', 'none');
			this.rawContentContainer.setStyle('display', 'block');
		}else{
			this.output.setStyle('display', 'block');
			this.rawContentContainer.setStyle('display', 'none');
		}
	}
});

// register namespaces
EnlighterJS.Language = {};
EnlighterJS.Renderer = {};
EnlighterJS.Util = {};
EnlighterJS.UI = {};

/*
---
name: Special Line Highlighter
description: Highlights special lines

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - core/1.4.5

provides: [EnlighterJS.SpecialLineHighlighter]
...
*/
EnlighterJS.SpecialLineHighlighter = new Class({
		
	// storage of line numbers to highlight
	specialLines: {},
	
	/**
	 * @constructs
	 * @param {String} html attribute content "highlight" - scheme 4,5,6,10-12,19
	 */
	initialize : function(lineNumberString, lineOffsetString){
		// special lines given ?
		if (lineNumberString == null || lineNumberString.length == 0){
			return;
		}
		
		// line offset available ?
		var lineOffset = (lineOffsetString != null && lineOffsetString.toInt() > 1 ? lineOffsetString.toInt()-1 : 0);
		
		// split attribute string into segments
		var segments = lineNumberString.split(',');
				
		// iterate over segments
		segments.each(function(item, index){
			// pattern xxxx-yyyy
			var parts = item.match(/([0-9]+)-([0-9]+)/);
			
			// single line or line-range
			if (parts!=null){				
				// 2 items required
				var start = parts[1].toInt()-lineOffset;
				var stop = parts[2].toInt()-lineOffset;
				
				// valid range ?
				if (stop > start){
					// add lines to storage
					for (var i=start;i<=stop;i++){
						this.specialLines['l' + i] = true;
					}
				}
			}else{
				// add line to storage
				this.specialLines['l' + (item.toInt()-lineOffset)] = true;
			}
		}.bind(this));
	},
	
	/**
	 * Check if the given linenumber is a special line
	 * @param Integer lineNumber
	 * @returns {Boolean}
	 */
	isSpecialLine: function(lineNumber){
		return (this.specialLines['l' + lineNumber] || false);
	}
	
});
/*
---
description: Code parsing engine for EnlighterJS

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.Language.generic]
...
*/
EnlighterJS.Language.generic = new Class({

	tokenizerType : 'Lazy',
	tokenizer : null,
	code : null,

	patterns : {},
	keywords : {},
	delimiters : {
		start: null,
		end: null
	},


	// commonly used Regex Patterns
	common : {
		// Matches a C style single-line comment.
		slashComments : /(?:^|[^\\])\/\/.*$/gm,

		// Matches a Perl style single-line comment.
		poundComments : /#.*$/gm,

		// Matches a C style multi-line comment
		multiComments : /\/\*[\s\S]*?\*\//gm,

		// Matches a string enclosed by single quotes. Legacy.
		aposStrings : /'[^'\\]*(?:\\.[^'\\]*)*'/gm,

		// Matches a string enclosed by double quotes. Legacy.
		quotedStrings : /"[^"\\]*(?:\\.[^"\\]*)*"/gm,

		// Matches a string enclosed by single quotes across multiple lines.
		multiLineSingleQuotedStrings : /'[^'\\]*(?:\\.[^'\\]*)*'/gm,

		// Matches a string enclosed by double quotes across multiple lines.
		multiLineDoubleQuotedStrings : /"[^"\\]*(?:\\.[^"\\]*)*"/gm,

		// Matches both.
		multiLineStrings : /'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"/gm,

		// Matches a string enclosed by single quotes.
		singleQuotedString : /'[^'\\\r\n]*(?:\\.[^'\\\r\n]*)*'/gm,

		// Matches a string enclosed by double quotes.
		doubleQuotedString : /"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/gm,

		// Matches both.
		strings : /'[^'\\\r\n]*(?:\\.[^'\\\r\n]*)*'|"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/gm,

		// Matches a property: .property style.
		properties : /\.([\w]+)\s*/gi,

		// Matches a method call: .methodName() style.
		methodCalls : /\.([\w]+)\s*\(/gm,

		// Matches a function call: functionName() style.
		functionCalls : /\b([\w]+)\s*\(/gm,

		// Matches any of the common brackets.
		brackets : /\{|\}|\(|\)|\[|\]/g,

		// Matches integers, decimals, hexadecimals.
		numbers : /\b((?:(\d+)?\.)?[0-9]+|0x[0-9A-F]+)\b/gi
	},

	/**
	 * Constructor.
	 * 
	 * @constructs
	 * @param {Object}
	 *            options
	 */
	initialize : function(code){
		// initialize language options
		this.setupLanguage();
		
		this.aliases = {};
		this.rules = {};
		this.code = code;

		// create new tokenizer
		this.tokenizer = new EnlighterJS.Tokenizer[this.tokenizerType]();

		// Add delimiter rules.
		if (this.delimiters.start){
			this.addRule('delimBeg', this.delimiters.start, 'de1');
		}

		if (this.delimiters.end){
			this.addRule('delimEnd', this.delimiters.end, 'de2');
		}

		// Set Keyword Rules from this.keywords object.
		Object.each(this.keywords, function(keywordSet, ruleName){
			// keyword set contains elements ?
			if (keywordSet.csv != ''){
				this.addRule(ruleName, this.csvToRegExp(keywordSet.csv, keywordSet.mod || "g"), keywordSet.alias);
			}
		}, this);

		// Set Rules from this.patterns object.
		Object.each(this.patterns, function(regex, ruleName){
			this.addRule(ruleName, regex.pattern, regex.alias);
		}, this);
	},
	
	// override this method to setup language params
	setupLanguage: function(){
	},

	getTokens : function(){
		return this.tokenizer.getTokens(this, this.code);
	},

	getRules : function(){
		return this.rules;
	},

	hasDelimiters : function(){
		return this.delimiters.start && this.delimiters.end;
	},

	addRule : function(ruleName, regex, className){
		this.rules[ruleName] = regex;
		this.addAlias(ruleName, className);
	},

	addAlias : function(key, alias){
		this.aliases[key] = alias || key;
	},

	csvToRegExp : function(csv, mod){
		return new RegExp('\\b(' + csv.replace(/,\s*/g, '|') + ')\\b', mod);
	},

	delimToRegExp : function(beg, esc, end, mod, suffix){
		beg = beg.escapeRegExp();
		if (esc){
			esc = esc.escapeRegExp();
		}
		end = (end) ? end.escapeRegExp() : beg;
		var pat = (esc) ? beg + "[^" + end + esc + '\\n]*(?:' + esc + '.[^' + end + esc + '\\n]*)*' + end : beg + "[^" + end + '\\n]*' + end;

		return new RegExp(pat + (suffix || ''), mod || '');
	},

	strictRegExp : function(){
		var regex = '(';
		for (var i = 0; i < arguments.length; i++){
			regex += arguments[i].escapeRegExp();
			regex += (i < arguments.length - 1) ? '|' : '';
		}
		regex += ')';
		return new RegExp(regex, "gim");
	}
});
/*
---
description: defines a key/value object with language aliases e.g. javascript -> js

license: MIT-style

authors:
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.LanguageManager]
...
*/
EnlighterJS.LanguageManager = new Class({
	
	Implements : Options,
	
	options: {
		'language': 'generic'
	},

	/**
	 * @constructs
	 * @param {Object} options The options object.
	 */
	initialize : function(options) {
		this.setOptions(options);
	},	
	
	// map of language aliases
	languageAliases: {
		'standard': 'generic',
		'js': 'javascript',
		'md': 'markdown',
		'c++': 'cpp',
		'c': 'cpp',
		'styles': 'css',
		'bash': 'shell',
		'json': 'javascript',
		'py': 'python',
		'html': 'xml',
		'jquery': 'javascript',
		'mootools': 'javascript',
		'ext.js': 'javascript',
		'c#': 'csharp'
	},
	
	// get language name, process aliases and default languages
	getLanguage: function(languageName){
		// get default language
		var defaultLanguage = (this.options.language != null ? this.options.language.trim().toLowerCase() : '');
		
		// alias available ?
		if (this.languageAliases[defaultLanguage]){
			defaultLanguage = this.languageAliases[defaultLanguage];
		}
		
		// default language class available ?
		if (defaultLanguage.trim() == '' || !EnlighterJS.Language[defaultLanguage]){
			defaultLanguage = 'generic';
		}
				
		// valid string ?
		if (languageName == null || languageName.trim() == ''){
			return defaultLanguage;
		}
		
		// "clean" languge name
		languageName = languageName.trim().toLowerCase();
		
		// alias available ?
		if (this.languageAliases[languageName]){
			languageName = this.languageAliases[languageName];
		}
		
		// language class available ?
		if (EnlighterJS.Language[languageName]){
			return languageName;
		}else{
			return defaultLanguage;
		}
	}		
});/*
---
description: Code parsing engine for Lighter.

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - Core/1.4.5

provides: [EnlighterJS.Tokenizer]
...
*/
EnlighterJS.Tokenizer = new Class({

	/**
	 * @constructs
	 */
	initialize : function(){
	},

	/**
	 * Parses source code using language regex rules and returns the array of tokens.
	 * 
	 * @param {Language}
	 *            language The Language to use for parsing.
	 * @param {String}
	 *            code The source code to parse.
	 * @param {Number}
	 *            [offset] Optional offset to add to the found index.
	 */
	getTokens : function(language, code){
		var text = null;
		var token = null;

		// parse code
		var tokens = this.parseTokens(language, code);

		// Add code between matches as an unknown token to the token array.
		for (var i = 0,pointer = 0; i < tokens.length; i++){
			if (pointer < tokens[i].index){
				text = code.substring(pointer, tokens[i].index);
				token = new EnlighterJS.Token(text, 'unknown', pointer);
				tokens.splice(i, 0, token);
			}
			pointer = tokens[i].end;
		}

		// Add the final unmatched piece if it exists.
		if (pointer < code.length){
			text = code.substring(pointer, code.length);
			token = new EnlighterJS.Token(text, 'unknown', pointer);
			tokens.push(token);
		}

		return tokens;
	},

	/**
	 * Parsing strategy method which child classes must override.
	 */
	parseTokens : function(language, code){
		throw new Error('Extending classes must override the parseTokens() method.');
	}
});
/*
---
description: Represents a token with its source code position and type.

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.Token]
...
*/
EnlighterJS.Token = new Class({
    
	text: null,
	type: null,
	index: -1,
	length: -1,
	end: -1,
	
    /**
     * Creates an instance of Token.
     *
     * @constructs
     * @param {String} text  The match text.
     * @param {String} type  The type of match.
     * @param {Number} index The index where the match was found.
     */
    initialize: function(text, type, index){
        this.text   = text;
        this.type   = type;
        this.index  = index;
        this.length = this.text.length;
        this.end    = this.index + this.length;
    },
    
    /**
     * Tests whether a Token is contained within this Token.
     * 
     * @param Token token The Token to test against.
     * @return Boolean Whether or not the Token is contained within this one.
     */
    contains: function(token){
        return (token.index >= this.index && token.index < this.end);
    },
    
    /**
     * Tests whether a this Token is past another Token.
     * 
     * @param Token token The Token to test against.
     * @return Boolean Whether or not this Token is past the test one.
     */
    isBeyond: function(token){
        return (this.index >= token.end);
    },
    
    /**
     * Tests whether a Token overlaps with this Token.
     * 
     * @param Token token The Token to test against.
     * @return Boolean Whether or not this Token overlaps the test one.
     */
    overlaps: function(token){
        return (this.index == token.index && this.length > token.length);
    },
    
    toString: function(){
        return this.index + ' - ' + this.text + ' - ' + this.end;
    }
});
/*
---
description: Compiles an array of tokens into inline elements, grabbed into a outer container.

license: MIT-style X11

authors:
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.Renderer.InlineRenderer]
...
*/
EnlighterJS.Renderer.InlineRenderer = new Class({
	Implements: Options,
	
	options : {
		inlineContainerTag : 'span'
	},

	initialize : function(options){
		this.setOptions(options);
	},

	/**
	 * Renders the generated Tokens
	 * 
	 * @param {Language} language The Language used when parsing.
	 * @param {SpecialLineHighlighter} specialLines Instance to define the lines to highlight           
	 * @return {Element} The renderer output
	 */
	render : function(language, specialLines, localOptions){
		// create output container element
		var container = new Element(this.options.inlineContainerTag);

		// generate output based on ordered list of tokens
		language.getTokens().each(function(token, index){
			// get classname
			var className = token.type ? (language.aliases[token.type] || token.type) : '';
			
			// create new inline element which contains the token - htmlspecialchars get escaped by mootools setText !
			container.grab(new Element('span', {
				'class': className,
				'text': token.text
			}));
		});

		return container;
	}
});
/*
---
description: Renders the generated Tokens into li-elements, grabbed into a outer ul/ol-container.

license: MIT-style X11

authors:
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.Renderer.BlockRenderer]
...
*/
EnlighterJS.Renderer.BlockRenderer = new Class({
	Implements: Options,
	
	options : {
		hover : 'hoverEnabled',
		oddClassname: 'odd',
		evenClassname: 'even',
		showLinenumbers: true
	},

	initialize : function(options){
		this.setOptions(options);
	},

	/**
	 * Renders the generated Tokens
	 * 
	 * @param {Language} language The Language used when parsing.
	 * @param {SpecialLineHighlighter} specialLines Instance to define the lines to highlight           
	 * @return {Element} The renderer output
	 */
	render : function(language, specialLines, localOptions){
		// create new outer container element - use ol tag if lineNumbers are enabled. element attribute settings are priorized
		var container = null;
		if (localOptions.lineNumbers != null){
			container = new Element((localOptions.lineNumbers.toLowerCase() === 'true') ? 'ol' : 'ul');
		}else{
			container = new Element(this.options.showLinenumbers ? 'ol' : 'ul');
		}
		
		// add "start" attribute ?
		if ((localOptions.lineNumbers || this.options.showLinenumbers) && localOptions.lineOffset && localOptions.lineOffset.toInt() > 1){
			container.set('start', localOptions.lineOffset);
		}
		
		// line number count
		var lineCounter = 1;
		
		// current line element
		var currentLine = new Element('li', {
			'class': (specialLines.isSpecialLine(lineCounter) ? 'specialline' : '')
		});
		
		// generate output based on ordered list of tokens
		language.getTokens().each(function(token, index){
			// get classname
			var className = token.type ? (language.aliases[token.type] || token.type) : '';
			
			// split the token into lines
			var lines = token.text.split('\n');
			
			// linebreaks found ?
			if (lines.length > 1){
				// just add the first line
				currentLine.grab(new Element('span', {
					'class': className,
					'text': lines.shift()
				}));
				
				// generate element for each line
				lines.each(function(line, lineNumber){
					// grab old line into output container
					container.grab(currentLine);
					
					// new line
					lineCounter++;
					
					// create new line, add special line classes
					currentLine = new Element('li', {
						'class': (specialLines.isSpecialLine(lineCounter) ? 'specialline' : '')
					});
										
					// create new token-element
					currentLine.grab(new Element('span', {
						'class': className,
						'text': line
					}));
				});				
			}else{
				// just add the token
				currentLine.grab(new Element('span', {
					'class': className,
					'text': token.text
				}));	
			}			
		});
		
		// grab last line into container
		container.grab(currentLine);

		// add odd/even classes
		if (this.options.evenClassname){
			container.getElements('li:even').addClass(this.options.evenClassname);
		}
		if (this.options.oddClassname){
			container.getElements('li:odd').addClass(this.options.oddClassname);
		}

		// highlight lines ?
		if (this.options.hover && this.options.hover != "NULL"){
			// add hover enable class
			container.getChildren().addClass(this.options.hover);
		}

		return container;
	}
});
/*
---
description: Lazy parsing engine for Lighter.

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - Core/1.4.5

provides: [Tokenizer.Lazy]
...
*/
EnlighterJS.Tokenizer.Lazy = new Class({

	Extends : EnlighterJS.Tokenizer,

	/**
	 * @constructs
	 */
	initialize : function(){
	},

	/**
	 * Brute force the matches by finding all possible matches from all rules. Then we sort them and cycle through the matches finding and eliminating inner matches. Faster than
	 * LighterTokenizer.Strict, but less robust and prone to erroneous matches.
	 * 
	 * @param {Language}
	 *            language The language to use for parsing.
	 * @param {String}
	 *            code The code to parse.
	 * @return {Array} The array of matches found.
	 */
	parseTokens : function(language, code){
		var tokens = [];
		var match = null;
		var text = null;
		var index = null;


		Object.each(language.getRules(), function(regex, rule){
			while (null !== (match = regex.exec(code))){
				index = match[1] && match[0].contains(match[1]) ? match.index + match[0].indexOf(match[1]) : match.index;
				text = match[1] || match[0];
				tokens.push(new EnlighterJS.Token(text, rule, index));
			}
		}, this);

		tokens = tokens.sort(function(token1, token2){
			return token1.index - token2.index;
		});

		for (var i = 0,j = 0; i < tokens.length; i++){

			if (tokens[i] === null){
				continue;
			}

			for (j = i + 1; j < tokens.length && tokens[i] !== null; j++){
				if (tokens[j] === null){
					continue;
				}else if (tokens[j].isBeyond(tokens[i])){
					break;
				}else if (tokens[j].overlaps(tokens[i])){
					tokens[i] = null;
				}else if (tokens[i].contains(tokens[j])){
					tokens[j] = null;
				}
			}
		}

		return tokens.clean();
	}
});
/*
---
description: XML parser engine for EnlighterJS

license: MIT-style

authors:
  - Andi Dittrich
  - Jose Prado

requires:
  - Core/1.4.5

provides: [EnlighterJS.Tokenizer.Xml]
...
*/
EnlighterJS.Tokenizer.Xml = new Class({

	Extends : EnlighterJS.Tokenizer,

	/**
	 * @constructs
	 */
	initialize : function(){
	},

	/**
	 * Xml Tokenizer
	 * 
	 * @author Jose Prado, Andi Dittrich
	 * 
	 * @param {Language}
	 *            lang The language to use for parsing.
	 * @param {String}
	 *            code The code to parse.
	 * @param {Number}
	 *            [offset] Optional offset to add to the match index.
	 * @return {Array} The array of tokens found.
	 */
	parseTokens : function(lang, code){
		// Tags + attributes matching and preprocessing.
		var tagPattern = /((?:\&lt;|<)[A-Z][A-Z0-9]*)(.*?)(\/?(?:\&gt;|>))/gi;
		var attPattern = /\b([\w-]+)([ \t]*)(=)([ \t]*)(['"][^'"]+['"]|[^'" \t]+)/gi;
		
		// tmp storage
		var tokens = [];
		var match = null;
		var attMatch = null;
		var index = 0;

		// Create array of matches containing opening tags, attributes, values, and separators.
		while ((match = tagPattern.exec(code)) != null){
			tokens.push(new EnlighterJS.Token(match[1], 'kw1', match.index));
			while ((attMatch = attPattern.exec(match[2])) != null){
				index = match.index + match[1].length + attMatch.index;
				tokens.push(new EnlighterJS.Token(attMatch[1], 'kw2', index)); // Attributes
				index += attMatch[1].length + attMatch[2].length;
				tokens.push(new EnlighterJS.Token(attMatch[3], 'kw1', index)); // Separators (=)
				index += attMatch[3].length + attMatch[4].length;
				tokens.push(new EnlighterJS.Token(attMatch[5], 'st0', index)); // Values
			}
			tokens.push(new EnlighterJS.Token(match[3], 'kw1', match.index + match[1].length + match[2].length));
		}

		// apply rules
		Object.each(lang.getRules(), function(regex, rule){
			while (null !== (match = regex.exec(code))){
				index = match[1] && match[0].contains(match[1]) ? match.index + match[0].indexOf(match[1]) : match.index;
				text = match[1] || match[0];
				tokens.push(new EnlighterJS.Token(text, rule, index));
			}
		}, this);

		// sort tokens
		tokens = tokens.sort(function(token1, token2){
			return token1.index - token2.index;
		});

		for (var i = 0,j = 0; i < tokens.length; i++){

			if (tokens[i] === null){
				continue;
			}

			for (j = i + 1; j < tokens.length && tokens[i] !== null; j++){
				if (tokens[j] === null){
					continue;
				}else if (tokens[j].isBeyond(tokens[i])){
					break;
				}else if (tokens[j].overlaps(tokens[i])){
					tokens[i] = null;
				}else if (tokens[i].contains(tokens[j])){
					tokens[j] = null;
				}
			}
		}
		return tokens.clean();
	}
});
/*
---
name: CodeWindow
description: Opens a new Window with the raw-sourcecode within

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - core/1.4.5

provides: [EnlighterJS.UI.CodeWindow]
...
*/
EnlighterJS.UI.CodeWindow = (function(code){
	// code "cleanup"
	code = code.replace(/&/gim, '&amp;').replace(/</gim, '&lt;').replace(/>/gim, '&gt;');

	// open new window
	var w = window.open('', '', 'width=' + (window.screen.width -200) + ', height=' + (screen.height-300) + ', menubar=no, titlebar=no, toolbar=no, top=100, left=100, scrollbars=yes, status=no');
	
	// insert code
	w.document.body.innerHTML = '<pre>' + code + '</pre>';
	w.document.title = 'EnlighterJS Sourcecode';
});



/*
---
name: Toolbar
description: Container which contains various buttons

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - core/1.4.5

provides: [EnlighterJS.UI.Toolbar]
...
*/
EnlighterJS.UI.Toolbar = new Class({
	Implements: Options,
	
	options: {
		toolbar: {
			rawTitle: 'Toggle RAW Code',
			windowTitle: 'Open Code in new Window',
			infoTitle: 'EnlighterJS Syntax Highlighter'
		}
	},

	// toolbar container
	container: null,
	
	initialize : function(enlighterInstance){
		// get options
		this.setOptions(enlighterInstance.options);
		
		// create outer container
		this.container = new Element('div', {
			'class': 'EnlighterJSToolbar'
		});
		
		// info button ?
		if (this.options.infoButton){
			// create window "button"
			this.container.grab(new Element('a', {
				'class': 'EnlighterJSInfoButton',
				title: this.options.toolbar.infoTitle,
				events: {
					// open new window on click
					click: function(){
						window.open('http://enlighterjs.andidittrich.de');
					}.bind(this)
				 }
			}));
		}
		
		// toggle button ?
		if (this.options.rawButton){
			// create toggle "button"
			this.container.grab(new Element('a', {
				'class': 'EnlighterJSRawButton',
				title: this.options.toolbar.rawTitle,
				events: {
					 click: function(){
						 // trigger toggle
						 enlighterInstance.toggleRawCode();
					 }.bind(this)
				 }
			}));		
		}
		
		// code window button ?
		if (this.options.windowButton){
			// create window "button"
			this.container.grab(new Element('a', {
				'class': 'EnlighterJSWindowButton',
				title: this.options.toolbar.windowTitle,
				events: {
					// open new window on click
					click: function(){
						EnlighterJS.UI.CodeWindow(enlighterInstance.getRawCode(false));
					}.bind(this)
				 }
			}));
		}		
		
		// clearfix
		this.container.grab(new Element('span', {
			'class': 'clear'
		}));
	},
	
	toElement: function(){
		return this.container;
	}	
});
/*
---
description: Extends MooTools.Element with the `enlight()` shortcut. Also adds `light()` and `unlight()` for backward compatibility with Lighter.js

license: MIT-style X11 License

authors:
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [Element.enlight]
...
 */
(function(){
	Element.implement({
		/**
		 * Highlights an element/Removes Element highlighting
		 *
		 * @param {Object, Boolean} [options] EnlighterJS options Object or Boolean value to enable/disable highlighting
		 * @returns {Element} The current Element instance.
		 */
		enlight: function(options){
			// mixed input check - options available ?
			options = (typeof(options) == "undefined") ? {} : options;
			
			// convert "true" to empty Object!
			options = (options===true) ? {} : options;
			
			// enlighter instance already available ?
			var enlighter = this.retrieve('EnlighterInstance');

			// hide highlighted sourcecode ?
			if (options === false){
				if (enlighter !== null) {
					enlighter.enlight(false);
				}
			// highlight sourcecode and use options	
			}else{
				// create new enlighter instance
				if (enlighter === null) {
					enlighter = new EnlighterJS(this, options, null);
					this.store('EnlighterInstance', enlighter);
				}
				enlighter.enlight(options);
			}
			
			// element instance
			return this;
		},
		
		/**
		 * Highlights an element
		 * @DEPRECATED since v2.0 - this method will be removed in the future
		 * @param {Object} [options] EnlighterJS Options Object
		 * @returns {Element} The current Element instance.
		 */
		light : function(options) {
			return this.enlight(options);
		},

		/**
		 * Removes/hides Element highlighting
		 * @DEPRECATED since v2.0 - this method will be removed in the future
		 * @returns {Element} The current Element instance.
		 */
		unlight : function(){
			return this.enlight(false);
		}
	});

})();/*
---
name: Helper
description: Helper to initialize multiple Enlighter instances on your page as well as code-groups

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - Core/1.4.5

provides: [EnlighterJS.Util.Helper]
...
*/
(function(){
	EnlighterJS.Util.Helper = (function(elements, options){
		// element grouping disabled?
		if (options.grouping===false){
			// highlight all elements
			elements.enlight(options);
			
		// use grouping	
		}else{
			// get separated groups and single elements
			var groups = {};
			var ungrouped = [];
			
			// group elements
			Array.each(elements, function(el){
				// extract group name
				var groupName = el.get('data-enlighter-group');
				
				// build element tree
				if (groupName){
					if (groups[groupName]){
						groups[groupName].push(el);
					}else{
						groups[groupName] = [el];
					}
				}else{
					ungrouped.push(el);
				}
			});
			
			// highlight single elements (non grouped)
			ungrouped.each(function(el){
				el.enlight(options);
			});
			
			// create & highlight groups
			Object.each(groups, function(obj){
				// copy options
				var localoptions = Object.clone(options);

				// force theme defined within options (all group members should have the same theme as group-leader)
				localoptions.forceTheme = true;
				
				// get group-leader theme
				localoptions.theme = obj[0].get('data-enlighter-theme') || options.theme || 'Enlighter';

				// create new tab pane
				var tabpane = new EnlighterJS.UI.TabPane(localoptions.theme);
				
				// put enlighted objects into the tabpane
				Array.each(obj, function(el, index){
					// create new tab - set title with fallback
					var container = tabpane.addTab(el.get('data-enlighter-title') || el.get('data-enlighter-language') || localoptions.language);
															
					// run enlighter
					(new EnlighterJS(el, localoptions, container)).enlight(true);
					
				}.bind(this));
				
				// select first tab (group-leader)
				tabpane.getContainer().inject(obj[0], 'before');
				tabpane.selectTab(0);
				
			}.bind(this));
		}	
	});
})();	
/*
---
name: TapPane
description: Displays multiple code-blocks within a group

license: MIT-style X11 License

authors:
  - Andi Dittrich
  
requires:
  - core/1.4.5

provides: [EnlighterJS.UI.TabPane]
...
*/
EnlighterJS.UI.TabPane = new Class({
		
	// wrapper container which contains the controls + panes
	container: null,
	
	// control container - contains the tab names
	controlContainer: null,
	
	// pane container - contains the tab panes
	paneContainer: null,
	
	// array of tab objects
	tabs: [],
	
	// current active tab
	selectedTabIndex: 0,
	
	/**
	 * @constructs
	 * @param {String} cssClassname The class-name of the outer container
	 */
	initialize : function(cssClassname) {
		// create container
		this.container = new Element('div', {
			'class': 'EnlighterJSTabPane ' + cssClassname.toLowerCase() + 'EnlighterJSTabPane'
		});
		
		// create container structure
		//	<div class="EnlighterJSTabPane ...">
		//    <div class="controls">
		//       <ul> <li>Tab1</li> .... </ul>
		//    </div>
		//    <div class="pane">
		//      <div>Enlighter Tab1</div>
		//      <div>Enlighter Tab2</div>
		//    </div>
		//  </div>
		this.controlContainer = new Element('ul');
		this.paneContainer = new Element('div', {
			'class': 'pane'
		});		
		var controlWrapper = new Element('div', {
			'class': 'controls'
		});
		controlWrapper.grab(this.controlContainer);
		controlWrapper.grab(new Element('div', {
			'class': 'clearfixList'
		}));
		
		this.container.grab(controlWrapper);
		this.container.grab(this.paneContainer);
	},
	
	selectTab: function(index){
		if (index < this.tabs.length){
			// hide current tab
			this.tabs[this.selectedTabIndex].pane.setStyle('display', 'none');
			this.tabs[this.selectedTabIndex].control.removeClass('selected');
			
			// show selected tab
			this.tabs[index].pane.setStyle('display', 'block');
			this.tabs[index].control.addClass('selected');
			
			// store selected index
			this.selectedTabIndex = index;
		}
	},
	
	addTab: function(name){
		// create new control element
		var ctrl = new Element('li', {
			text: name
		});
		this.controlContainer.grab(ctrl);
		
		// get new tab position
		var tabIndex = this.tabs.length;
		
		// select event - display tab
		ctrl.addEvent('click', function(){
			this.selectTab(tabIndex);
		}.bind(this));
		
		// create new tab element
		var tab = new Element('div', {
			'styles': {
				'display': 'none'
			}
		});
		this.paneContainer.grab(tab);
		
		// store new tab
		this.tabs.push({
			control: ctrl,
			pane: tab
		});
		
		// return created tab element
		return tab;
	},
		
	getContainer: function(){
		return this.container;
	}

	
});
/*
---
description: Automatical element highlighting using meta tag options

license: MIT-style X11 License

authors:
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS]
...
*/
window.addEvent('domready', function(){
	// metadata config available ? -> autoinit
	var m = document.getElement('meta[name="EnlighterJS"]');
	
	// check instance
	if (!m){
		return;
	}
	
	// create new options object
	var options = {
		language: m.get('data-language') || 'generic',
		theme: m.get('data-theme') || 'Enlighter',
		indent: m.get('data-indent').toInt() || -1,
		hover: m.get('data-hover') || 'hoverEnabled',
		rawButton: (m.get('data-rawcodebutton')==='true'),
		windowButton: (m.get('data-windowbutton')==='true'),
		infoButton: (m.get('data-infobutton')==='true'),
		showLinenumbers: (m.get('data-linenumbers')!=='false')
	};

	// selector available ? if not, match all pre-tags
	var blockSelector = m.get('data-selector-block') || 'pre';
	
	// selector available ? if not, match all pre-tags
	var inlineSelector = m.get('data-selector-inline') || 'code';
	
	// highlight all matching block tags
	if (blockSelector != 'NULL'){
		options.renderer = 'Block';
		EnlighterJS.Util.Helper(document.getElements(blockSelector), options);
	}
	
	// highlight all matching inline tags
	if (inlineSelector != 'NULL'){
		options.renderer = 'Inline';
		options.grouping = false;
		EnlighterJS.Util.Helper(document.getElements(inlineSelector), options);
	}
});/*
---
description: Simple global-initialization of inline+block codeblocks

license: MIT-style X11 License

authors:
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.Util.Init]
...
*/
(function(){
	EnlighterJS.Util.Init = (function(blockSelector, inlineSelector, options){
		// highlight all matching block tags
		if (blockSelector){
			options.renderer = 'Block';
			EnlighterJS.Util.Helper(document.getElements(blockSelector), options);
		}
		
		// highlight all matching inline tags
		if (inlineSelector){
			options.renderer = 'Inline';
			options.grouping = false;
			EnlighterJS.Util.Helper(document.getElements(inlineSelector), options);
		}
	});
})();/*
---
description: Cpp Language.

license: MIT-style

authors:
  - Andi Dittrich

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.cpp]
...
*/
EnlighterJS.Language.cpp = new Class({
    
    Extends: EnlighterJS.Language.generic,
        
    setupLanguage: function() {
        this.keywords = {
            cpp: {
            	csv: "and,and_eq,asm,auto,bitand,bitor,bool,break,case,catch,char,class,compl,const,const_cast,continue,default,delete,do,double,dynamic_cast,else,enum,explicit,export,extern,false,float,for,friend,goto,if,inline,int,long,mutable,namespace,new,not,not_eq,operator,or,or_eq,private,protected,public,register,reinterpret_cast,return,short,signed,sizeof,static,static_cast,struct,switch,template,this,throw,true,try,typedef,typeid,typename,union,unsigned,using,virtual,void,volatile,wchar_t,while,xor,xor_eq",
                alias: 'kw1'
            },
            cppX11: {
            	csv: "alignas,alignof,char16_t,char32_t,constexpr,decltype,noexcept,nullptr,static_assert,thread_local",
                alias: 'kw4'
            },
            directives: {
            	csv: "__LINE__,__FILE__,__DATE__,__TIME__,__cplusplus",
            	alias: 'kw2'
            }
        };
        
        this.patterns = {
            'slashComments': { pattern: this.common.slashComments, alias: 'co1'},
            'multiComments': { pattern: this.common.multiComments, alias: 'co2'},
            'chars':         { pattern: this.common.singleQuotedString, alias: 'st0' },
            'strings':       { pattern: this.common.doubleQuotedString, alias: 'st1' },
            'annotation':    { pattern: /@[\W\w_][\w\d_]+/gm, alias: 'st1' },
            'numbers':       { pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][-+]?[0-9]+)?|0x[A-F0-9]+|0b[0-1_]+)\b/gim, alias: 'nu0' },
            'properties':    { pattern: this.common.properties, alias: 'me0' },
            'brackets':      { pattern: this.common.brackets, alias: 'br0' },
            'functionCalls': { pattern: this.common.functionCalls, alias: 'de1'},
            'directives':	 { pattern: /#.*$/gm, alias: 'kw2'}
        };
    }
});
/*
---
description: C Sharp Language patterns.

license: MIT-style

authors:
  - Joshua Maag

requires:
  - Core/1.4.5
  
provides: [EnlighterJS.Language.csharp]
...
*/
EnlighterJS.Language.csharp = new Class ({
    
    Extends: EnlighterJS.Language.generic,

    setupLanguage: function(){
        this.keywords = {
            reserved: {
                csv:   "as, base, break, case, catch, checked, continue, default, do, else, event, explicit, false, finally, fixed, for, foreach, goto, if, implicit, internal, is, lock, namespace, new, null, operator, params, private, protected, public, ref, return, sizeof, stackalloc, switch, this, throw, true, try, typeof, unchecked, using, void, while",
                alias: 'kw1'
            },
            keywords: {
            	csv:   "abstract, async, class, const, delegate, dynamic, event, extern, in, interface, out, override, readonly, sealed, static, unsafe, virtual, volatile",
            	alias: 'kw3'
            },
            primitives: {
                csv:   "bool, byte, char, decimal, double, enum, float, int, long, sbyte, short, struct, uint, ulong, ushort, object, string",
                alias: 'kw2'
            },
            internal: {
            	csv:   "System",
            	alias: 'kw4'
            }
        },
        
        this.patterns = {
            'slashComments': { pattern: this.common.slashComments, alias: 'co1'},
            'multiComments': { pattern: this.common.multiComments, alias: 'co2'},
            'chars':         { pattern: this.common.singleQuotedString, alias: 'st0' },
            'strings':       { pattern: this.common.doubleQuotedString, alias: 'st1' },
            'numbers':       { pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][-+]?[0-9]+)?|0x[A-F0-9]+|0b[0-1_]+)\b/gim, alias: 'nu0' },
            'brackets':      { pattern: this.common.brackets, alias: 'br0' },
            'functionCalls': { pattern: this.common.functionCalls, alias: 'me0'},
			'methodCalls':   { pattern: this.common.methodCalls, alias: 'me1'}
        };
        
    }
});
/*
---
description: XML language.

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.xml]
...
*/
EnlighterJS.Language.xml = new Class({

	Extends : EnlighterJS.Language.generic,
	tokenizerType : 'Xml',

	setupLanguage: function(){
		// Common HTML patterns
		this.patterns = {
			'comments' : {
				pattern : /(?:\&lt;|<)!--[\s\S]*?--(?:\&gt;|>)/gim,
				alias : 'co2'
			},
			'cdata' : {
				pattern : /(?:\&lt;|<)!\[CDATA\[[\s\S]*?\]\](?:\&gt;|>)/gim,
				alias : 'st1'
			},
			'closingTags' : {
				pattern : /(?:\&lt;|<)\/[A-Z][A-Z0-9]*?(?:\&gt;|>)/gi,
				alias : 'kw1'
			},
			'doctype' : {
				pattern : /(?:\&lt;|<)!DOCTYPE[\s\S]+?(?:\&gt;|>)/gim,
				alias : 'st2'
			},
			'version' : {
				pattern : /(?:\&lt;|<)\?xml[\s\S]+?\?(?:\&gt;|>)/gim,
				alias : 'kw2'
			}
		};
	}

});
/*
---
description: CSS language fuel.

license: MIT-style

authors:
  - Jose Prado

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.css]
...
*/
EnlighterJS.Language.css = new Class({
    
    Extends: EnlighterJS.Language.generic,
        
    setupLanguage: function() {
        
        this.keywords = {
            css1: {
                csv: "background-attachment, background-color, background-image, background-position, background-repeat, background, border-bottom, border-bottom-width, border-color, border-left, border-left-width, border-right, border-right-width, border-style, border-top, border-top-width, border-width, border, clear, color, display, float, font-family, font-size, font-style, font-variant, font-weight, font, height, letter-spacing, line-height, list-style-image, list-style-position, list-style-type, list-style, margin-bottom, margin-left, margin-right, margin-top, margin, padding-bottom, padding-left, padding-right, padding-top, padding, text-align, text-decoration, text-indent, text-transform, vertical-align, white-space, width, word-spacing",
                alias: 'kw1'
            },
            css2: {
                csv: "azimuth, border-bottom-color, border-bottom-style, border-collapse, border-left-color, border-left-style, border-right-color, border-right-style, border-spacing, border-top-color, border-top-style, bottom, caption-side, clip, content, counter-increment, counter-reset, cue, cue-after, cue-before, cursor, direction, elevation, empty-cells, left, max-height, max-width, min-height, min-width, orphans, outline, outline-color, outline-style, outline-width, overflow, page-break-after, page-break-before, page-break-inside, pause, pause-after, pause-before, pitch, pitch-range, play-during, position, quotes, richness, right, speak, speak-header, speak-numeral, speak-punctuation, speech-rate, stress, table-layout, top, unicode-bidi, visibility, voice-family, volume, widows, z-index",
                alias: 'kw1'
            },
            css3: {
                csv: "alignment-adjust, alignment-baseline, appearance, background-break, background-clip, background-origin, background-size, baseline-shift, binding, bookmark-label, bookmark-level, bookmark-target, border-bottom-left-radius, border-bottom-right-radius, border-break, border-image, border-length, border-radius, border-top-left-radius, border-top-right-radius, box-align, box-direction, box-flex, box-flex-group, box-lines, box-orient, box-pack, box-shadow, box-sizing, color-profile, column-break-after, column-break-before, column-count, column-fill, column-gap, column-rule, column-rule-color, column-rule-style, column-rule-width, column-span, column-width, columns, crop, display-model, display-role, dominant-baseline, drop-initial-after-adjust, drop-initial-after-align, drop-initial-before-adjust, drop-initial-before-align, drop-initial-size, drop-initial-value, fit, fit-position, float-offset, font-effect, font-emphasize, font-emphasize-position, font-emphasize-style, font-size-adjust, font-smooth, font-stretch, grid-columns, grid-rows, hanging-punctuation, hyphenate-after, hyphenate-before, hyphenate-character, hyphenate-lines, hyphenate-resource, hyphens, icon, image-orientation, image-resolution, inline-box-align, line-stacking, line-stacking-ruby, line-stacking-shift, line-stacking-strategy, mark, mark-after, mark-before, marker-offset, marks, marquee-direction, marquee-play-count, marquee-speed, marquee-style, move-to, nav-down, nav-index, nav-left, nav-right, nav-up, opacity, outline-offset, overflow-style, overflow-x, overflow-y, page, page-policy, phonemes, presentation-level, punctuation-trim, rendering-intent, resize, rest, rest-after, rest-before, rotation, rotation-point, ruby-align, ruby-overhang, ruby-position, ruby-span, size, string-set, tab-side, target, target-name, target-new, target-position, text-align-last, text-emphasis, text-height, text-justify, text-outline, text-replace, text-shadow, text-wrap, voice-balance, voice-duration, voice-pitch, voice-pitch-range, voice-rate, voice-stress, voice-volume, white-space-collapse, word-break, word-wrap",
                alias: 'kw2'
            },
            values: {
                csv: "100, 200, 300, 400, 500, 600, 700, 800, 900, above, absolute, always, aqua, armenian, auto, avoid, baseline, below, bidi-override, black, blink, block, blue, bold, bolder, both, bottom, break-all, break-strict, break-word, break, capitalize, caption, center, circle, cjk-ideographic, close-quote, collapse, compact, condensed, crop, cross, crosshair, dashed, decimal-leading-zero, decimal, default, disc, dotted, double, e-resize, embed, expanded, extra-condensed, extra-expanded, fixed, fuchsia, georgian, gray, green, groove, hand, hebrew, help, hidden, hide, higher, hiragana-iroha, hiragana, icon, inherit, inline-table, inline, inset, inside, invert, italic, justify, katakana-iroha, katakana, keep-all, konq-center, landscape, large, larger, left, level, light, lighter, lime, line-through, list-item, loose, loud, lower-alpha, lower-greek, lower-latin, lower-roman, lowercase, lower, ltr, marker, maroon, medium, menu, message-box, middle, mix, move, n-resize, narrower, navy, ne-resize, never, no-close-quote, no-open-quote, no-repeat, none, normal, nowrap, nw-resize, oblique, olive, open-quote, outset, outside, overline, pointer, portrait, pre-wrap, pre, purple, red, relative, repeat, repeat-x, repeat-y, ridge, right, rtl, run-in, s-resize, scroll, se-resize, semi-condensed, semi-expanded, separate, show, silver, small-caps, small-caption, smaller, small, solid, square, static-position, static, status-bar, sub, super, sw-resize, table-caption, table-cell, table-column-group, table-column, table-footer-group, table-header-group, table-row, table-row-group, table, teal, text-bottom, text-top, text, thick, thin, top, transparent, ultra-condensed, ultra-expanded, underline, upper-alpha, upper-latin, upper-roman, uppercase, visible, w-resize, wait, white, wider, x-large, x-small, xx-large, xx-small, yellow",
                alias: 'kw3'
            }
        };
        
        this.patterns = {
            'multiComments': { pattern: this.common.multiComments, alias: 'co1' },
            'strings':       { pattern: this.common.strings,       alias: 'st0' },
            'selectors':     { pattern: /([^\}\n]+)\{/gi,          alias: 'se0' },
            'uri':           { pattern: /url\s*\([^\)]*\)/gi,      alias: 'kw4' },
            'units':         { pattern: /\b(\d+[\.\d+]?\s*(px|pt|em|ex|cm|in|mm|pc|%)?)/gi, alias: 'nu0' },
            'hexColors':     { pattern: /(#[A-F0-9]{3}([A-F0-9]{3})?)\b/gi,                 alias: 'kw3' },
            'rgbColors':     { pattern: /(rgb\s*\(([1-2]?[0-9]{2}(\,\s*)?){3}\))/g,         alias: 'kw3' }
        };
        
        this.delimiters = {
            start: this.strictRegExp('<style type="text/css">'),
            end:   this.strictRegExp('</style>')
        };
        
    }
});
/*
---
description: Java language fuel.

license: MIT-style

authors:
  - Italo Maia
  - Andi Dittrich

requires:
  - Core/1.4.5
  
provides: [EnlighterJS.Language.java]
...
*/
EnlighterJS.Language.java = new Class ({
    
    Extends: EnlighterJS.Language.generic,

    setupLanguage: function(code)
    {
        this.keywords = {
            reserved: {
                csv:   "continue, for, new, switch, assert, default, goto, synchronized, do, if, this, break, throw, else, throws, case, instanceof, return, transient, catch, try, final, finally, strictfp, volatile, const, native, super, while",
                alias: 'kw1'
            },
            keywords: {
            	csv:   "abstract, package, private, implements, protected, public, import, extends, interface, static, void, class",
            	alias: 'kw3'
            },
            primitives: {
                csv:   "byte, short, int, long, float, double, boolean, char, String",
                alias: 'kw2'
            },
            internal: {
            	csv:   "System",
            	alias: 'kw4'
            }
        },
        
        this.patterns = {
            'slashComments': { pattern: this.common.slashComments, alias: 'co1'},
            'multiComments': { pattern: this.common.multiComments, alias: 'co2'},
            'chars':         { pattern: this.common.singleQuotedString, alias: 'st0' },
            'strings':       { pattern: this.common.doubleQuotedString, alias: 'st1' },
            'annotation':    { pattern: /@[\W\w_][\w\d_]+/gm, alias: 'st1' },
            'numbers':       { pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][-+]?[0-9]+)?|0x[A-F0-9]+|0b[0-1_]+)\b/gim, alias: 'nu0' },
            'properties':    { pattern: this.common.properties, alias: 'me0' },
            'brackets':      { pattern: this.common.brackets, alias: 'br0' },
            'functionCalls': { pattern: this.common.functionCalls, alias: 'kw1'}
        };
        
    }
});
/*
---
description: JavaScript language fuel.

license: MIT-style

authors:
  - Jose Prado

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.javascript]
...
*/
EnlighterJS.Language.javascript = new Class({
    
    Extends: EnlighterJS.Language.generic,
    
    setupLanguage: function()
    {
        this.keywords = {
            commonKeywords: {
                csv: "as, break, case, catch, continue, delete, do, else, eval, finally, for, if, in, is, item, instanceof, return, switch, this, throw, try, typeof, void, while, write, with",
                alias: 'kw1'
            },
            langKeywords: {
                csv: "class, const, default, debugger, export, extends, false, function, import, namespace, new, null, package, private, protected, public, super, true, use, var",
                alias: 'kw2'
            },
            windowKeywords: {
                csv: "alert, back, blur, close, confirm, focus, forward, home, navigate, onblur, onerror, onfocus, onload, onmove, onresize, onunload, open, print, prompt, scroll, status, stop",
                alias: 'kw3'
            }
        };
        
        this.patterns = {
            'slashComments': {
                pattern: this.common.slashComments,
                alias:   'co1'
            },
            'multiComments': {
                pattern: this.common.multiComments,
                alias:   'co2'
            },
            'strings': {
                pattern: this.common.strings,
                alias:   'st0'
            },
            'methodCalls': {
                pattern: this.common.properties,
                alias:   'me0'
            },
            'brackets': {
                pattern: this.common.brackets,
                alias:   'br0'
            },
            'numbers': {
                pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][-+]?[0-9]+)?|0x[A-F0-9]+)\b/gi,
                alias:   'nu0'
            },
            'regex': {
                pattern: this.delimToRegExp("/", "\\", "/", "g", "[gimy]*"),
                alias:   're0'
            },
            'symbols': {
                pattern: /\+|-|\*|\/|%|!|@|&|\||\^|\<|\>|=|,|\.|;|\?|:/g,
                alias:   'sy0'
            }
        };
        
        this.delimiters = {
            start: this.strictRegExp('<script type="text/javascript">', '<script language="javascript">'),
            end:   this.strictRegExp('</script>')
        };
        
    }
});
/*
---
description: Markdown language

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - core/1.4.5
  
provides: [EnlighterJS.Language.markdown]
...
*/
EnlighterJS.Language.markdown = new Class ({
    
    Extends: EnlighterJS.Language.generic,
    
    setupLanguage: function(code){
        this.patterns = {
            'header1': { pattern: /^(.+)\n=+\n/gim,   alias: 'st1' },
            'header2': { pattern: /^(.+)\n-+\n/gim,   alias: 'st2' },
            'header3': { pattern: /[#]{1,6}.*/gim,    alias: 'st0' },
            'ul':      { pattern: /^\*\s*.*/gim,      alias: 'kw1' },
            'ol':      { pattern: /^\d+\..*/gim,      alias: 'kw1' },
            'italics': { pattern: /\*.*?\*/g,         alias: 'kw3' },
            'bold':    { pattern: /\*\*.*?\*\*/g,     alias: 'kw3' },
            'url':     { pattern: /\[[^\]]*\]\([^\)]*\)/g, alias: 'kw4' }
        };
        
    }
    
});
/*
---
description: PHP language fuel.

license: MIT-style

authors:
  - Jose Prado

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.php]
...
*/
EnlighterJS.Language.php = new Class({
    
    Extends: EnlighterJS.Language.generic,
    
    setupLanguage: function(){
        this.keywords = {
            keywords: {
                csv: "abstract, and, as, break, case, catch, cfunction, class, clone, const, continue, declare, default, do, else, elseif, enddeclare, endfor, endforeach, endif, endswitch, endwhile, extends, final, for, foreach, function, global, goto, if, implements, interface, instanceof, namespace, new, old_function, or, private, protected, public, static, switch, throw, try, use, var, while, xor",
                alias: 'kw1'
            },
            langConstants: {
                csv: "__CLASS__, __DIR__, __FILE__, __FUNCTION__, __METHOD__, __NAMESPACE__, DEFAULT_INCLUDE_PATH, E_ALL, E_COMPILE_ERROR, E_COMPILE_WARNING, E_CORE_ERROR, E_CORE_WARNING, E_ERROR, E_NOTICE, E_PARSE, E_STRICT, E_USER_ERROR, E_USER_NOTICE, E_USER_WARNING, E_WARNING, PEAR_EXTENSION_DIR, PEAR_INSTALL_DIR, PHP_BINDIR, PHP_CONFIG_FILE_PATH, PHP_DATADIR, PHP_EXTENSION_DIR, PHP_LIBDIR, PHP_LOCALSTATEDIR, PHP_OS, PHP_OUTPUT_HANDLER_CONT, PHP_OUTPUT_HANDLER_END, PHP_OUTPUT_HANDLER_START, PHP_SYSCONFDIR, PHP_VERSION",
                alias: 'kw1'
            },
            constructs: {
                csv: "array, die, echo, empty, exit, eval, include, include_once, isset, list, require, require_once, return, print, unset",
                alias: 'kw1'
            },
            commonFuncs: {
                csv: "abs, addcslashes, addslashes, aggregate, apache_child_terminate, apache_get_version, apache_lookup_uri, apache_note, apache_request_headers, apache_response_headers, apache_setenv, array_change_key_case, array_chunk, array_count_values, array_diff, array_diff_assoc, array_fill, array_filter, array_flip, array_intersect, array_intersect_assoc, array_key_exists, array_keys, array_map, array_merge, array_merge_recursive, array_multisort, array_pad, array_pop, array_push, array_rand, array_reduce, array_reverse, array_search, array_shift, array_slice, array_splice, array_sum, array_unique, array_unshift, array_values, array_walk, arsort, asort, assert, assert_options, base64_decode, base64_encode, base_convert, basename, bin2hex, bindec, ceil, chdir, checkdate, chop, chown, chunk_split, clearstatcache, closedir, compact, connection_aborted, connection_status, constant, copy, count, count_chars, crc32, crypt, ctype_alnum, ctype_alpha, ctype_cntrl, ctype_digit, ctype_graph, ctype_lower, ctype_print, ctype_punct, ctype_space, ctype_upper, ctype_xdigit, current, date, debug_backtrace, debug_zval_dump, decbin, dechex, decoct, define, defined, dir, dirname, dl, doubleval, each, end, ereg, ereg_replace, eregi, eregi_replace, error_log, error_reporting, escapeshellarg, escapeshellcmd, exec, explode, extension_loaded, extract, fclose, feof, fflush, fgetc, fgetcsv, fgets, fgetss, file, file_exists, file_get_contents, fileatime, filectime, filegroup, fileinode, filemtime, fileowner, fileperms, filesize, filetype, floatval, flock, floor, flush, fmod, fnmatch, fopen, fpassthru, fputs, fread, fscanf, fseek, fsockopen, fstat, ftell, ftok, ftruncate, func_get_arg, func_get_args, func_num_args, fwrite, get_browser, get_cfg_var, get_declared_classes, get_extension_funcs, get_include_path, get_loaded_extensions, get_magic_quotes_gpc, get_magic_quotes_runtime, get_meta_tags, getallheaders, getcwd, getdate, getenv, getimagesize, getopt, getrandmax, getrusage, gettimeofday, gettype, glob, global, gmdate, gmmktime, gmstrftime, header, headers_sent, hebrev, hebrevc, hexdec, highlight_file, highlight_string, html_entity_decode, htmlentities, htmlspecialchars, ignore_user_abort, image_type_to_mime_type, implode, import_request_variables, in_array, ini_alter, ini_get, ini_get_all, ini_restore, ini_set, intval, ip2long, is_array, is_bool, is_dir, is_double, is_executable, is_file, is_finite, is_float, is_infinite, is_int, is_integer, is_link, is_long, is_nan, is_null, is_numeric, is_object, is_readable, is_real, is_resource, is_scalar, is_string, is_uploaded_file, is_writable, is_writeable, join, key, key_exists, krsort, ksort, link, linkinfo, localeconv, localtime, long2ip, lstat, ltrim, magic_quotes_runtime, mail, max, md5, md5_file, memory_get_usage, microtime, min, mkdir, mktime, move_uploaded_file, mt_getrandmax, mt_rand, mt_srand, natcasesort, natsort, next, nl2br, number_format, ob_clean, ob_end_clean, ob_end_flush, ob_flush, ob_get_clean, ob_get_contents, ob_get_flush, ob_get_length, ob_get_level, ob_get_status, ob_implicit_flush, ob_list_handlers, ob_start, octdec, opendir, overload, pack, parse_ini_file, parse_str, parse_url, passthru, pathinfo, pclose, pfsockopen, pg_affected_rows, pg_cancel_query, pg_client_encoding, pg_close, pg_cmdtuples, pg_connect, pg_connection_busy, pg_connection_reset, pg_connection_status, pg_convert, pg_copy_from, pg_copy_to, pg_dbname, pg_delete, pg_end_copy, pg_errormessage, pg_escape_bytea, pg_escape_string, pg_exec, pg_fetch_all, pg_fetch_array, pg_fetch_assoc, pg_fetch_object, pg_fetch_result, pg_fetch_row, pg_field_is_null, pg_field_name, pg_field_num, pg_field_prtlen, pg_field_size, pg_field_type, pg_fieldisnull, pg_fieldname, pg_fieldnum, pg_fieldprtlen, pg_fieldsize, pg_fieldtype, pg_free_result, pg_freeresult, pg_get_notify, pg_get_pid, pg_get_result, pg_getlastoid, pg_host, pg_insert, pg_last_error, pg_last_notice, pg_last_oid, pg_lo_close, pg_lo_create, pg_lo_export, pg_lo_import, pg_lo_open, pg_lo_read, pg_lo_read_all, pg_lo_seek, pg_lo_tell, pg_lo_unlink, pg_lo_write, pg_loclose, pg_locreate, pg_loexport, pg_loimport, pg_loopen, pg_loread, pg_loreadall, pg_lounlink, pg_lowrite, pg_meta_data, pg_num_fields, pg_num_rows, pg_numfields, pg_numrows, pg_options, pg_pconnect, pg_ping, pg_port, pg_put_line, pg_query, pg_result, pg_result_error, pg_result_seek, pg_result_status, pg_select, pg_send_query, pg_set_client_encoding, pg_trace, pg_tty, pg_unescape_bytea, pg_untrace, pg_update, phpcredits, phpinfo, phpversion, popen, pos, preg_grep, preg_match, preg_match_all, preg_quote, preg_replace, preg_replace_callback, preg_split, prev, print_r, printf, proc_close, proc_open, putenv, quoted_printable_decode, quotemeta, rand, range, rawurldecode, rawurlencode, readdir, readfile, readlink, realpath, rename, reset, restore_error_handler, restore_include_path, rewind, rewinddir, rmdir, round, rsort, rtrim, serialize, session_cache_expire, session_cache_limiter, session_decode, session_destroy, session_encode, session_get_cookie_params, session_id, session_is_registered, session_module_name, session_name, session_regenerate_id, session_register, session_save_path, session_set_cookie_params, session_set_save_handler, session_start, session_unregister, session_unset, session_write_close, set_error_handler, set_file_buffer, set_include_path, set_magic_quotes_runtime, set_socket_blocking, set_time_limit, setcookie, setlocale, settype, shell_exec, show_source, shuffle, similar_text, sizeof, sleep, socket_get_status, socket_set_blocking, socket_set_timeout, sort, split, spliti, sprintf, sql_regcase, srand, sscanf, stat, static, str_pad, str_repeat, str_replace, str_rot13, str_shuffle, str_word_count, strcasecmp, strchr, strcmp, strcoll, strcspn, stream_context_create, stream_context_get_options, stream_context_set_option, stream_context_set_params, stream_filter_append, stream_filter_prepend, stream_get_meta_data, stream_register_wrapper, stream_select, stream_set_blocking, stream_set_timeout, stream_set_write_buffer, stream_wrapper_register, strftime, strip_tags, stripcslashes, stripslashes, stristr, strlen, strnatcasecmp, strnatcmp, strncasecmp, strncmp, strpos, strrchr, strrev, strrpos, strspn, strstr, strtok, strtolower, strtotime, strtoupper, strtr, strval, substr, substr_count, substr_replace, system, tempnam, time, tmpfile, touch, trigger_error, trim, uasort, ucfirst, ucwords, uksort, umask, uniqid, unlink, unpack, unserialize, urldecode, urlencode, user_error, usleep, usort, var_dump, var_export, version_compare, virtual, vprintf, vsprintf, wordwrap",
                alias: 'kw2'
            },
            database: {
                csv: "mysql, mysql_affected_rows, mysql_client_encoding, mysql_close, mysql_connect, mysql_create_db, mysql_createdb, mysql_data_seek, mysql_db_name, mysql_db_query, mysql_dbname, mysql_drop_db, mysql_dropdb, mysql_errno, mysql_error, mysql_escape_string, mysql_fetch_array, mysql_fetch_assoc, mysql_fetch_field, mysql_fetch_lengths, mysql_fetch_object, mysql_fetch_row, mysql_field_flags, mysql_field_len, mysql_field_name, mysql_field_seek, mysql_field_table, mysql_field_type, mysql_fieldflags, mysql_fieldlen, mysql_fieldname, mysql_fieldtable, mysql_fieldtype, mysql_free_result, mysql_freeresult, mysql_get_client_info, mysql_get_host_info, mysql_get_proto_info, mysql_get_server_info, mysql_info, mysql_insert_id, mysql_list_dbs, mysql_list_fields, mysql_list_processes, mysql_list_tables, mysql_listdbs, mysql_listfields, mysql_listtables, mysql_num_fields, mysql_num_rows, mysql_numfields, mysql_numrows, mysql_pconnect, mysql_query, mysql_real_escape_string, mysql_result, mysql_select_db, mysql_selectdb, mysql_stat, mysql_table_name, mysql_tablename, mysql_thread_id, mysql_unbuffered_query, mysqli, mysqli_affected_rows, mysqli_autocommit, mysqli_bind_param, mysqli_bind_result, mysqli_change_user, mysqli_character_set_name, mysqli_client_encoding, mysqli_close, mysqli_commit, mysqli_connect, mysqli_data_seek, mysqli_debug, mysqli_disable_reads_from_master, mysqli_disable_rpl_parse, mysqli_dump_debug_info, mysqli_enable_reads_from_master, mysqli_enable_rpl_parse, mysqli_errno, mysqli_error, mysqli_escape_string, mysqli_execute, mysqli_fetch, mysqli_fetch_array, mysqli_fetch_assoc, mysqli_fetch_field, mysqli_fetch_field_direct, mysqli_fetch_fields, mysqli_fetch_lengths, mysqli_fetch_object, mysqli_fetch_row, mysqli_field_count, mysqli_field_seek, mysqli_field_tell, mysqli_free_result, mysqli_get_client_info, mysqli_get_host_info, mysqli_get_proto_info, mysqli_get_server_info, mysqli_get_server_version, mysqli_info, mysqli_init, mysqli_insert_id, mysqli_kill, mysqli_master_query, mysqli_num_fields, mysqli_num_rows, mysqli_options, mysqli_param_count, mysqli_ping, mysqli_prepare, mysqli_prepare_result, mysqli_profiler, mysqli_query, mysqli_read_query_result, mysqli_real_connect, mysqli_real_escape_string, mysqli_real_query, mysqli_reload, mysqli_rollback, mysqli_rpl_parse_enabled, mysqli_rpl_probe, mysqli_rpl_query_type, mysqli_select_db, mysqli_send_long_data, mysqli_send_query, mysqli_set_opt, mysqli_slave_query, mysqli_ssl_set, mysqli_stat, mysqli_stmt_affected_rows, mysqli_stmt_close, mysqli_stmt_errno, mysqli_stmt_error, mysqli_stmt_store_result, mysqli_store_result, mysqli_thread_id, mysqli_thread_safe, mysqli_use_result, mysqli_warning_count",
                alias: 'kw2'
            }
        };
        
        this.patterns = {
            'slashComments': { pattern: this.common.slashComments, alias: 'co1' },
            'multiComments': { pattern: this.common.multiComments, alias: 'co2' },
            'strings':       { pattern: this.common.strings,       alias: 'st0' },
            'heredocs':      { pattern: /(<<<\s*?(\'?)([A-Z0-9]+)\2[^\n]*?\n[\s\S]*?\n\3(?![A-Z0-9\s]))/gim, alias: 'st1' },
            'numbers':       { pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][\-+]?[0-9]+)?|0x[A-F0-9]+)\b/gi,       alias: 'nu0' },
            'variables':     { pattern: /[\$]{1,2}[A-Z_][\w]*/gim, alias: 'kw3' },
            'functions':     { pattern: this.common.functionCalls, alias: 'me1' },
            'constants':     { pattern: /\b[A-Za-z_][\w]*\b/g,     alias: 'kw4' },
            'methods':       { pattern: /->([\w]+)/gim,            alias: 'kw3' },
            'brackets':      { pattern: this.common.brackets,      alias: 'br0' }
            //'symbols':     { pattern: /!|@|%|&|\||\/|<|>|=|-|\+|\*|\.|:|,|;/g, alias: 'sy0' }
        };
        
        // Delimiters
        this.delimiters = {
            start: this.strictRegExp('<?php', '<?=', '<%'),
            end:   this.strictRegExp('?>', '%>')
        };
        
    }
});
/*
---
description: Python language fuel.

license: MIT-style

authors:
  - Italo Maia

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.python]
...
*/
EnlighterJS.Language.python = new Class({
    
    Extends: EnlighterJS.Language.generic,
    
    setupLanguage: function()
    {
        this.keywords = {
            reserved:{
                csv:"and, del, from, not, while, as, elif, global, or, with, assert, else, if, pass, yield, break, except, import, print, class, exec, in, raise, continue, finally, is, return, def, for, lambda, try",
                alias:'kw1'
            },
            functions:{
                csv:"__import__, abs, all, any, apply, bin, callable, chr, cmp, coerce, compile, delattr, dir, divmod, eval, execfile, filter, format, getattr, globals, hasattr, hash, hex, id, input, intern, isinstance, issubclass, iter, len, locals, map, max, min, next, oct, open, ord, pow, print, range, raw_input, reduce, reload, repr, round, setattr, sorted, sum, unichr, vars, zip",
                alias:'kw2'
            },
            classes:{
                csv:"ArithmeticError, AssertionError, AttributeError, BaseException, BufferError, BytesWarning, DeprecationWarning, EOFError, EnvironmentError, Exception, FloatingPointError, FutureWarning, GeneratorExit, IOError, ImportError, ImportWarning, IndentationError, IndexError, KeyError, KeyboardInterrupt, LookupError, MemoryError, NameError, NotImplementedError, OSError, OverflowError, PendingDeprecationWarning, ReferenceError, RuntimeError, RuntimeWarning, StandardError, StopIteration, SyntaxError, SyntaxWarning, SystemError, SystemExit, TabError, TypeError, UnboundLocalError, UnicodeDecodeError, UnicodeEncodeError, UnicodeError, UnicodeTranslateError, UnicodeWarning, UserWarning, ValueError, Warning, ZeroDivisionError, basestring, bool, buffer, bytearray, bytes, classmethod, complex, dict, enumerate, file, float, frozenset, int, list, long, object, property, reversed, set, slice, staticmethod, str, super, tuple, type, unicode, xrange",
                alias:'kw2'
            }
        },
        
        this.patterns = {
            'poundComments': {
                pattern: this.common.poundComments,
                alias:'co1'
            },
            /*
            'multiComments': {
                pattern: /^=begin[\s\S]*?^=end/gm,
                alias: 'co2'
            },*/
            'multiStringComments1': {
                pattern:  /"""[\s\S]*?"""/gm,
                alias: 'co2'
            },
            'multiStringComments2': {
                pattern:  /'''[\s\S]*?'''/gm,
                alias: 'co2'
            },
            'strings': {
                pattern: this.common.strings,
                alias: 'st0'
            },
            'tickStrings': {
                pattern: this.delimToRegExp("`","\\","`","gm"),
                alias: 'st0'
            },
            'delimString': {
                pattern: /(%[q|Q|x]?(\W)[^\2\\\n]*(?:\\.[^\2\\]*)*(\2|\)|\]|\}))/gm,
                alias: 'st1'
            },
            'heredoc': {
                pattern: /(<<(\'?)([A-Z0-9]+)\2[^\n]*?\n[\s\S]*\n\3(?![\w]))/gim,
                alias: 'st2'
            },
            'variables': {
                pattern: /(@[A-Za-z_][\w]*|@@[A-Za-z_][\w]*|\$(?:\-[\S]|[\w]+)|\b[A-Z][\w]*)/g,
                alias: 'kw3'
            },
            'rubySymbols': {
                pattern: /[^:](:[\w]+)/g,
                alias: 'kw4'
            },
            'constants': {
                pattern: /\b[A-Z][\w]*/g,
                alias: 'kw3'
            },
            'numbers': {
                pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][-+]?[0-9]+)?|0x[A-F0-9]+|0b[0-1_]+)\b/gim,
                alias: 'nu0'
            },
            'properties': {
                pattern: this.common.properties,
                alias: 'me0'
            },
            'brackets': {
                pattern: this.common.brackets,
                alias: 'br0'
            },
            'delimRegex': {
                pattern: /(%r(\W)[^\2\\\n]*(?:\\.[^\2\\\n]*?)*(\2|\)|\]|\})[iomx]*)/gm,
                alias: 're0'
            },
            'literalRegex': {
                pattern: this.delimToRegExp("/","\\","/","g","[iomx]*"),
                alias: 're0'
            }
        };
          
    }
});
/*
---
description: Ruby language fuel.

license: MIT-style

authors:
  - Jose Prado

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.ruby]
...
*/
EnlighterJS.Language.ruby = new Class ({
    
    Extends: EnlighterJS.Language.generic,
    
    setupLanguage: function()
    {
        this.keywords = {
            reserved: {
                csv: "__FILE__, __LINE__, alias, and, BEGIN, begin, break, case, class, def, defined, do, else, elsif, END, end, ensure, false, for, if, in, module, next, nil, not, or, redo, rescue, retry, return, self, super, then, true, undef, unless, until, when, while, yield",
                alias: 'kw1'
            },
            functions: {
                csv: "abort, at_exit, autoload, binding, block_given, callcc, caller, catch, chomp, chop, eval, exec, exit, exit!, fail, fork, format, gets, global_variables, gsub, lambda, proc, load, local_variables, loop, open, p, print, proc, putc, puts, raise, fail, rand, readline, readlines, require, scan, select, set_trace_func, sleep, split, sprintf, format, srand, syscall, system, sub, test, throw, trace_var, trap, untrace_var",
                alias: 'kw2'
            },
            classes: {
                csv: "Abbrev, ArgumentError, Array, Base64, Benchmark, Benchmark::Tms, Bignum, Binding, CGI, Cookie, HtmlExtension, QueryExtension, Session, FileStore, MemoryStore, Class, Comparable, Complex, ConditionVariable, Continuation, Data, Date, DateTime, Dir, EOFError, Enumerable, Errno, Exception, FalseClass, File, Constants, Stat, FileTest, FileUtils, CopyContext_, DryRun, NoWrite, Verbose, Find, Fixnum, Float, FloatDomainError, GC, Generator, Hash, IO, IOError, Iconv, Failure, IllegalSequence, InvalidCharacter, OutOfRange, IndexError, Integer, Interrupt, Kernel, LoadError, LocalJumpError, Logger, Application, LogDevice, Severity, ShiftingError, Marshal, MatchData, Math, Matrix, Method, Module, Mutex, NameError, NilClass, NoMemoryError, NoMethodError, NotImplementedError, Numeric, Object, ObjectSpace, Observable, Pathname, Precision, Proc, Process, GID, Status, Sys, UID, Queue, Range, RangeError, Regexp, RegexpError, RuntimeError, ScriptError, SecurityError, Set, Shellwords, Signal, SignalException, Singleton, SingletonClassMethods, SizedQueue, SortedSet, StandardError, String, StringScanner, StringScanner::Error, Struct, Symbol, SyncEnumerator, SyntaxError, SystemCallError, SystemExit, SystemStackError, Tempfile, Test, Unit, Thread, ThreadError, ThreadGroup, ThreadsWait, Time, TrueClass, TypeError, UnboundMethod, Vector, YAML, ZeroDivisionError, Zlib, BufError, DataError, Deflate, Error, GzipFile, CRCError, Error, LengthError, NoFooter, GzipReader, GzipWriter, Inflate, MemError, NeedDict, StreamEnd, StreamError, VersionError, ZStream, fatal",
                alias: 'kw2'
            }
        },
        
        this.patterns = {
            'poundComments': { pattern: this.common.poundComments, alias: 'co1' },
            'multiComments': { pattern: /^=begin[\s\S]*?^=end/gm,  alias: 'co2' },
            
            'strings':     { pattern: this.common.strings,                                        alias: 'st0' },
            'tickStrings': { pattern: this.delimToRegExp("`", "\\", "`", "gm"),                   alias: 'st0' },
            'delimString': { pattern: /(%[q|Q|x]?(\W)[^\2\\\n]*(?:\\.[^\2\\]*)*(\2|\)|\]|\}))/gm, alias: 'st1' },
            'heredoc':     { pattern: /(<<(\'?)([A-Z0-9]+)\2[^\n]*?\n[\s\S]*\n\3(?![\w]))/gim,    alias: 'st2' },
            
            //'instanceVar': { pattern: /@[A-Z_][\w]*/gi,       alias: 'kw3' },
            //'classVar':    { pattern: /@@[A-Z_][\w]*/gi,      alias: 'kw3' },
            //'globalVar':   { pattern: /\$(?:\-[\S]|[\w]+)/gi, alias: 'kw3' },
            'variables':   { pattern: /(@[A-Za-z_][\w]*|@@[A-Za-z_][\w]*|\$(?:\-[\S]|[\w]+)|\b[A-Z][\w]*)/g, alias: 'kw3' },
            'rubySymbols': { pattern: /[^:](:[\w]+)/g, alias: 'kw4' },
            'constants':   { pattern: /\b[A-Z][\w]*/g, alias: 'kw3' },
            
            'numbers':    { pattern: /\b((([0-9]+)?\.)?[0-9_]+([e][-+]?[0-9]+)?|0x[A-F0-9]+|0b[0-1_]+)\b/gim, alias: 'nu0' },
            'properties': { pattern: this.common.properties, alias: 'me0' },
            'brackets':   { pattern: this.common.brackets,   alias: 'br0' },
            
            'delimRegex':   { pattern: /(%r(\W)[^\2\\\n]*(?:\\.[^\2\\\n]*?)*(\2|\)|\]|\})[iomx]*)/gm, alias: 're0' },
            'literalRegex': { pattern: this.delimToRegExp("/", "\\", "/", "g", "[iomx]*"),           alias: 're0' }
        };
        
    }
});
/*
---
description: Shell language fuel.

license: MIT-style

authors:
  - Jose Prado

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.shell]
...
*/
EnlighterJS.Language.shell = new Class ({
    
    Extends: EnlighterJS.Language.generic,
    
    setupLanguage: function()
    {
        this.keywords = {
            keywords: {
                csv: 'if, fi, then, elif, else, for, do, done, until, while, break, continue, case, function, return, in, eq, ne, gt, lt, ge, le',
                alias: 'kw0'
            },
            commands: {
                csv: 'alias, apropos, awk, bash, bc, bg, builtin, bzip2, cal, cat, cd, cfdisk, chgrp, chmod, chown, chrootcksum, clear, cmp, comm, command, cp, cron, crontab, csplit, cut, date, dc, dd, ddrescue, declare, df, diff, diff3, dig, dir, dircolors, dirname, dirs, du, echo, egrep, eject, enable, env, ethtool, eval, exec, exit, expand, export, expr, false, fdformat, fdisk, fg, fgrep, file, find, fmt, fold, format, free, fsck, ftp, gawk, getopts, grep, groups, gzip, hash, head, history, hostname, id, ifconfig, import, install, join, kill, less, let, ln, local, locate, logname, logout, look, lpc, lpr, lprint, lprintd, lprintq, lprm, ls, lsof, make, man, mkdir, mkfifo, mkisofs, mknod, more, mount, mtools, mv, netstat, nice, nl, nohup, nslookup, open, op, passwd, paste, pathchk, ping, popd, pr, printcap, printenv, printf, ps, pushd, pwd, quota, quotacheck, quotactl, ram, rcp, read, readonly, renice, remsync, rm, rmdir, rsync, screen, scp, sdiff, sed, select, seq, set, sftp, shift, shopt, shutdown, sleep, sort, source, split, ssh, strace, su, sudo, sum, symlink, sync, tail, tar, tee, test, time, times, touch, top, traceroute, trap, tr, true, tsort, tty, type, ulimit, umask, umount, unalias, uname, unexpand, uniq, units, unset, unshar, useradd, usermod, users, uuencode, uudecode, v, vdir, vi, watch, wc, whereis, which, who, whoami, wget, xargs, yes',
                alias: 'kw1'
            }
        },
        
        this.patterns = {
            'poundComments': {
                pattern: this.common.poundComments,
                alias:   'co1'
            },
            'strings': {
                pattern: this.common.strings,
                alias:   'st0'
            }
        };
    }
});
/*
---
description: SQL language fuel.

license: MIT-style

authors:
  - Jose Prado
  - Andi Dittrich

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.sql]
...
*/
EnlighterJS.Language.sql = new Class ({
    
    Extends: EnlighterJS.Language.generic,
    
    setupLanguage: function(){
        this.keywords = {
            keywords: {
                csv: 'savepoint, start, absolute, action, add, after, alter, as, asc, at, authorization, begin, bigint, binary, bit, by, cascade, char, character, check, checkpoint, close, collate, column, commit, committed, connect, connection, constraint, contains, continue, create, cube, current, current_date, current_time, cursor, database, date, deallocate, dec, decimal, declare, default, delete, desc, distinct, double, drop, dynamic, else, end, end-exec, escape, except, exec, execute, false, fetch, first, float, for, force, foreign, forward, free, from, full, function, global, goto, grant, group, grouping, having, hour, ignore, index, inner, insensitive, insert, instead, int, integer, intersect, into, is, isolation, key, last, level, load, local, max, min, minute, modify, move, name, national, nchar, next, no, numeric, of, off, on, only, open, option, order, out, output, partial, password, precision, prepare, primary, prior, privileges, procedure, public, read, real, references, relative, repeatable, restrict, return, returns, revoke, rollback, rollup, rows, rule, schema, scroll, second, section, select, sequence, serializable, set, size, smallint, static, statistics, table, temp, temporary, then, time, timestamp, to, top, transaction, translation, trigger, true, truncate, uncommitted, union, unique, update, values, varchar, varying, view, when, where, with, work',
                alias: 'kw1',
                mod: 'gi'
            },
            functions: {
                csv: 'abs, avg, case, cast, coalesce, convert, count, current_timestamp, current_user, day, isnull, left, lower, month, nullif, replace, right, session_user, space, substring, sum, system_user, upper, user, year',
                alias: 'kw2',
                mod: 'gi'
            },
            operators: {
                csv: 'all, and, any, between, cross, in, join, like, not, null, or, outer, some, if',
                alias: 'kw3',
                mod: 'gi'
            }
        },
        
        this.patterns = {
            'singleLineComments': {pattern: /--(.*)$/gm, alias: 'co0'},
            'multiLineComments':  {pattern: this.common.multiComments, alias: 'co1'},
            'multiLineStrings':   {pattern: this.common.multiLineStrings, alias: 'st0'},
            'numbers':			  {pattern: this.common.numbers, alias: 'nu0'},
            'columns':			  {pattern: /`[^`\\]*(?:\\.[^`\\]*)*`/gm, alias: 'kw4'}
        };
    }
});
/*
---
description: Nullsoft Scriptable Install System (NSIS)

license: MIT-style

authors:
  - Jan T. Sott
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.Language.nsis]
...
*/
EnlighterJS.Language.nsis = new Class({

	Extends : EnlighterJS.Language.generic,

	setupLanguage : function(){
		/** Set of keywords in CSV form. Add multiple keyword hashes for differentiate keyword sets. */

		this.keywords = {
			commands : {
				csv : "Function, PageEx, Section, SectionGroup, SubSection, Abort, AddBrandingImage, AddSize, AllowRootDirInstall, AllowSkipFiles, AutoCloseWindow, BGFont, BGGradient, BrandingText, BringToFront, Call, CallInstDLL, Caption, ChangeUI, CheckBitmap, ClearErrors, CompletedText, ComponentText, CopyFiles, CRCCheck, CreateDirectory, CreateFont, CreateShortCut, Delete, DeleteINISec, DeleteINIStr, DeleteRegKey, DeleteRegValue, DetailPrint, DetailsButtonText, DirText, DirVar, DirVerify, EnableWindow, EnumRegKey, EnumRegValue, Exch, Exec, ExecShell, ExecWait, ExpandEnvStrings, File, FileBufSize, FileClose, FileErrorText, FileOpen, FileRead, FileReadByte, FileReadUTF16LE, FileReadWord, FileSeek, FileWrite, FileWriteByte, FileWriteUTF16LE, FileWriteWord, FindClose, FindFirst, FindNext, FindWindow, FlushINI, FunctionEnd, GetCurInstType, GetCurrentAddress, GetDlgItem, GetDLLVersion, GetDLLVersionLocal, GetErrorLevel, GetFileTime, GetFileTimeLocal, GetFullPathName, GetFunctionAddress, GetInstDirError, GetLabelAddress, GetTempFileName, Goto, HideWindow, Icon, IfAbort, IfErrors, IfFileExists, IfRebootFlag, IfSilent, InitPluginsDir, InstallButtonText, InstallColors, InstallDir, InstallDirRegKey, InstProgressFlags, InstType, InstTypeGetText, InstTypeSetText, IntCmp, IntCmpU, IntFmt, IntOp, IsWindow, LangString, LicenseBkColor, LicenseData, LicenseForceSelection, LicenseLangString, LicenseText, LoadLanguageFile, LockWindow, LogSet, LogText, ManifestDPIAware, ManifestSupportedOS, MessageBox, MiscButtonText, Name, Nop, OutFile, Page, PageCallbacks, PageExEnd, Pop, Push, Quit, ReadEnvStr, ReadINIStr, ReadRegDWORD, ReadRegStr, Reboot, RegDLL, Rename, RequestExecutionLevel, ReserveFile, Return, RMDir, SearchPath, SectionEnd, SectionGetFlags, SectionGetInstTypes, SectionGetSize, SectionGetText, SectionGroupEnd, SectionIn, SectionSetFlags, SectionSetInstTypes, SectionSetSize, SectionSetText, SendMessage, SetAutoClose, SetBrandingImage, SetCompress, SetCompressor, SetCompressorDictSize, SetCtlColors, SetCurInstType, SetDatablockOptimize, SetDateSave, SetDetailsPrint, SetDetailsView, SetErrorLevel, SetErrors, SetFileAttributes, SetFont, SetOutPath, SetOverwrite, SetPluginUnload, SetRebootFlag, SetRegView, SetShellVarContext, SetSilent, ShowInstDetails, ShowUninstDetails, ShowWindow, SilentInstall, SilentUnInstall, Sleep, SpaceTexts, StrCmp, StrCmpS, StrCpy, StrLen, SubCaption, SubSectionEnd, Unicode, UninstallButtonText, UninstallCaption, UninstallIcon, UninstallSubCaption, UninstallText, UninstPage, UnRegDLL, Var, VIAddVersionKey, VIFileVersion, VIProductVersion, WindowIcon, WriteINIStr, WriteRegBin, WriteRegDWORD, WriteRegExpandStr, WriteRegStr, WriteUninstaller, XPStyle",
				alias : 'kw1'
			},
			states : {
				csv : "admin, all, auto, both, colored, false, force, hide, highest, lastused, leave, listonly, none, normal, notset, off, on, open, print, show, silent, silentlog, smooth, textonly, true, user",
				alias : 'kw2'
			},
			statics : {
				csv : "ARCHIVE, FILE_ATTRIBUTE_ARCHIVE, FILE_ATTRIBUTE_NORMAL, FILE_ATTRIBUTE_OFFLINE, FILE_ATTRIBUTE_READONLY, FILE_ATTRIBUTE_SYSTEM, FILE_ATTRIBUTE_TEMPORARY, HKCR, HKCU, HKDD, HKEY_CLASSES_ROOT, HKEY_CURRENT_CONFIG, HKEY_CURRENT_USER, HKEY_DYN_DATA, HKEY_LOCAL_MACHINE, HKEY_PERFORMANCE_DATA, HKEY_USERS, HKLM, HKPD, HKU, IDABORT, IDCANCEL, IDIGNORE, IDNO, IDOK, IDRETRY, IDYES, MB_ABORTRETRYIGNORE, MB_DEFBUTTON1, MB_DEFBUTTON2, MB_DEFBUTTON3, MB_DEFBUTTON4, MB_ICONEXCLAMATION, MB_ICONINFORMATION, MB_ICONQUESTION, MB_ICONSTOP, MB_OK, MB_OKCANCEL, MB_RETRYCANCEL, MB_RIGHT, MB_RTLREADING, MB_SETFOREGROUND, MB_TOPMOST, MB_USERICON, MB_YESNO, NORMAL, OFFLINE, READONLY, SHCTX, SHELL_CONTEXT, SYSTEM, TEMPORARY",
				alias : 'kw3'
			}
		};

		/** Set of RegEx patterns to match */
		this.patterns = {
			'brackets' : {
				pattern : this.common.brackets,
				alias : 'br0'
			},
			'commentMultiline' : {
				pattern : this.common.multiComments,
				alias : 'co2'
			},
			'commentPound' : {
				pattern : this.common.poundComments,
				alias : 'co1'
			},
			'commentSemicolon' : {
				pattern : /;.*$/gm,
				alias : 'co1'
			},
			'compilerFlags' : {
				pattern : /(\!(addincludedir|addplugindir|appendfile|cd|define|delfile|echo|else|endif|error|execute|finalize|getdllversionsystem|ifdef|ifmacrodef|ifmacrondef|ifndef|if|include|insertmacro|macroend|macro|makensis|packhdr|searchparse|searchreplace|tempfile|undef|verbose|warning))/g,
				alias : 'kw2'
			},
			'defines' : {
				pattern : /[\$]\{{1,2}[0-9a-zA-Z_][\w]*[\}]/gim,
				alias : 'kw4'
			},
			'jumps' : {
				pattern : /([(\+|\-)]([0-9]+))/g,
				alias : 'nu0'
			},
			'langStrings' : {
				pattern : /[\$]\({1,2}[0-9a-zA-Z_][\w]*[\)]/gim,
				alias : 'kw3'
			},
			'escapeChars' : {
				pattern : /([\$]\\(n|r|t|[\$]))/g,
				alias : 'kw4'
			},
			'numbers' : {
				pattern : /\b((([0-9]+)?\.)?[0-9_]+([e][\-+]?[0-9]+)?|0x[A-F0-9]+)\b/gi,
				alias : 'nu0'
			},
			'pluginCommands' : {
				pattern : /(([0-9a-zA-Z_]+)[:{2}]([0-9a-zA-Z_]+))/g,
				alias : 'kw2'
			},
			'strings' : {
				pattern : this.common.strings,
				alias : 'st0'
			},
			'variables' : {
				pattern : /[\$]{1,2}[0-9a-zA-Z_][\w]*/gim,
				alias : 'kw4'
			},
		};

	}
});
/*
---
description: RAW Language - returns pure raw text

license: MIT-style

authors:
  - Andi Dittrich

requires:
  - Core/1.4.5

provides: [EnlighterJS.Language.raw]
...
*/
EnlighterJS.Language.raw = new Class({
    
    Extends: EnlighterJS.Language.generic,
        
    initialize: function(code) {
    	this.code = code;
    },
    
    getTokens: function(){
    	// raw means "no-highlight" - return a single, unknown token with the given sourcecode
    	return [
    	        new EnlighterJS.Token(this.code, '', 0)
    	];
    }
});
/*
---
description: "DIFF" language - usefull for SVN/GIT changes :)

license: MIT-style

authors:
  - Andi Dittrich

requires:
  - core/1.4.5

provides: [EnlighterJS.Language.diff]
...
*/
EnlighterJS.Language.diff = new Class({
	Extends : EnlighterJS.Language.generic,

	setupLanguage: function(){
		this.keywords = {
		};

		this.patterns = {
			
			'comments' : {
				pattern : /^((---|\+\+\+) .*)/gm,
				alias : 'co1'
			},
			
			'stats' : {
				pattern : /^(@@.*@@\s*)/gm,
				alias : 'nu0'
			},
			
			'add' : {
				pattern : /^(\+.*)/gm,
				alias : 're0'
			},
			
			'del'  : {
				pattern : /^(-.*)/gm,
				alias : 'st0'
			}
		};
	}
});
