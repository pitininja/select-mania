//highlight code
var Highlight = {

	//effectue highlight syntaxe code
	run: function(selector) {
		//si conteneur précisé
		var $container = $('body');
		if(typeof selector !== 'undefined') {
			$container = $(selector);
		}
		//parcoure blocs de code
		$container.find('pre code').each(function(i, block) {
			//tim sauts de ligne
			block.innerHTML = block.innerHTML.replace(/^\s+|\s+$/g, '');
			//convertit caractères html pour empêcher rendering
			if($(block).attr('class') === 'html') {
				block.innerHTML = block.innerHTML.replace(/[<>&\n]/g, function(x) {
					return {
						'<': '&lt;',
						'>': '&gt;',
						'&': '&amp;',
						'\n': '<br />'
					}[x];
				});
			}
			//highlight syntaxe code
			hljs.highlightBlock(block);
		});
	}

};