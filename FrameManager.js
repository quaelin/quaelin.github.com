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
		VERSION = FrameManager.VERSION = '0.0.3',
		a = FrameManager.a = atom.create(),
		frames = FrameManager.frames = atom.create(),
		getScript = $.getScript
	;

	FrameManager.atom = atom;
	FrameManager.jQuery = $;

	function nameToID(name) {
		return 'frame_' + name;
	}

	FrameManager.load = function (name) {
		frames.once(name, function (frame) {
			frame.show();
		});
		if (frames.has(name)) {
			return;
		}

		var
			frameID = nameToID(name),
			frameJQ = $('<div id="' + frameID + '">' +
				'<iframe name="' + name + '" src="frame.html?name=' + name + '"/>' +
			'</div>').css({
				'background': 'white',
				'border': '1px solid #ccc',
				'bottom': '0',
				'left': '0',
				'position': 'absolute',
				'right': '0',
				'top': '0'
			}),
			frame = atom.create().mixin({
				id: frameID,
				name: name,
				jq: frameJQ,
				show: function () {
					frame.set('show', new Date());
				}
			}),
			iframe = frameJQ.find('iframe').css({
				border: 'none',
				height: '100%',
				width: '100%'
			}),
			lastShow
		;

		frame.on('show', function (show) {
			var currentFrame = FrameManager.currentFrame;
			if (currentFrame) {
				if (currentFrame.name === name) {
					return;
				}
				currentFrame.jq.animate({
					'bottom': '100px',
					'opacity': '0.7',
					'right': '5px',
					'top': '100px',
					'z-index': '1'
				}, 'fast');
			}
			frameJQ.animate({
				'bottom': '15px',
				'left': '15px',
				'opacity': '1',
				'right': '100px',
				'top': '30px',
				'z-index': '2'
			}, 'medium');
			FrameManager.currentFrame = frame;
		});

		a.once('mainDiv', function (mainDiv) {
			mainDiv.append(frameJQ);
		});

		frames.set(name, frame);
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
		var ver = $('<div>FrameManager ' + VERSION + '</div>').css({
			'bottom': '0',
			'color': '#aaa',
			'opacity': '0',
			'position': 'absolute',
			'right': '0'
		}).hover(
			function () {
				ver.animate({ opacity: '1' });
			},
			function () {
				ver.animate({ opacity: '0' });
			}
		).appendTo(mainDiv);
	});

}(atom, jQuery));
