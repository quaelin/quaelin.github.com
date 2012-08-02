/*global global, jQuery, module*/
(function (jQuery) {

	// Make a module
	var Frame = (function (name) {
		var root = typeof window !== 'undefined' ? window : global,
			had = Object.prototype.hasOwnProperty.call(root, name),
			prev = root[name], me = root[name] = {};
		if (typeof module !== 'undefined' && module.exports) {
			module.exports = me;
		}
		me.noConflict = function () {
			root[name] = had ? prev : undefined;
			if (!had) {
				try {
					delete root[name];
				} catch (ex) {
				}
			}
			return this;
		};
		return me;
	}('Frame'));

	var
		FrameManager = Frame.Manager = window.parent.FrameManager,
		atom = Frame.atom = FrameManager.atom,
		$ = Frame.jQuery = jQuery,
		getScript = $.getScript
	;

	function getParameterByName(name) {
		name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
		var
			regexS = '[\\?&]' + name + '=([^&#]*)',
			regex = new RegExp(regexS),
			results = regex.exec(window.location.search)
		;
		return results ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : '';
	}

	getScript('frames/' + getParameterByName('name') + '/index.js');

}(jQuery));
