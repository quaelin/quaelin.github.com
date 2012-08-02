/*global Frame, TWTR*/
(function (Frame) {
	var
		atom = Frame.atom,
		a = atom.create(),
		$ = Frame.jQuery,
		getScript = $.getScript
	;

	a.provide('TWTR', function (done) {
		getScript('http://widgets.twimg.com/j/2/widget.js', function () {
			done(TWTR);
		});
	});

	a.provide('@quaelin profile widget', function (done) {
		a.need('TWTR', function (TWTR) {
			done(new TWTR.Widget({
				version: 2,
				type: 'profile',
				rpp: 4,
				interval: 30000,
				width: 250,
				height: 300,
				theme: {
					shell: {
						background: '#333333',
						color: '#ffffff'
					},
					tweets: {
						background: '#000000',
						color: '#ffffff',
						links: '#4aed05'
					}
				},
				features: {
					scrollbar: true,
					loop: false,
					live: true,
					behavior: 'all'
				}
			}).render().setUser('quaelin').start());
		});
	});

	a.need('@quaelin profile widget', function () {});
	
}(Frame));
