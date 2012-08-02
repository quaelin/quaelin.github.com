/*global atom, FrameManager, global, jQuery, module*/
(function (atom, $) {

	// Make a module
	var qdotg = (function (name) {
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
	}('qdotg'));

	var
		a = qdotg.a = atom.create(),
		each = $.each,
		getScript = $.getScript,
		VERSION = qdotg.VERSION = '0.0.2'
	;

	qdotg.atom = atom;
	qdotg.jQuery = $;

	a.provide('FrameManager', function (done) {
		getScript('FrameManager.js', function () {
			done(FrameManager);
		});
	});

	a.need('FrameManager', function (FrameManager) {
		FrameManager.load('twitter');
	});


}(atom, jQuery));
