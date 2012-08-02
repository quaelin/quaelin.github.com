/*global atom, global, jQuery, module*/
(function (atom, $) {

	// Make a module
	var FrameManager = (function (name) {
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
	}('FrameManager'));

	var
		VERSION = FrameManager.VERSION = '0.0.1',
		a = FrameManager.a = atom.create(),
		getScript = $.getScript
	;

	FrameManager.atom = atom;
	FrameManager.jQuery = $;

	FrameManager.load = function (name) {
		var iframe = $(
			'<iframe name="' + name + '" src="frame.html?name=' + name + '"/>'
		).css({
		});
		a.once('mainDiv', function (mainDiv) {
			mainDiv.append(iframe);
		});
	};

	$(function () {
		a.set('mainDiv', $('<div></div>').css({
			'bottom': '0',
			'left': '0',
			'position': 'absolute',
			'right': '0',
			'top': '0'
		}).appendTo(document.body));
	});

	a.once('mainDiv', function (mainDiv) {
		mainDiv.append($('<div>' + VERSION + '</div>').css({
			'bottom': '0',
			'position': 'absolute',
			'right': '0'
		}));
	});

}(atom, jQuery));
