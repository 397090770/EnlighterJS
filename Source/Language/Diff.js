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
