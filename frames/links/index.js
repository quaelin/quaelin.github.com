/*global Frame*/
(function (Frame) {
	var
		atom = Frame.atom,
		a = atom.create(),
		$ = Frame.jQuery,
		each = $.each,
		getScript = $.getScript,
		urls = [
			'http://about.me/chris.c',
			'http://christophercampbell.wordpress.com/',
			'https://facebook.com/chris.campbell',
			'http://flickr.com/photos/quaelin',
			'https://github.com/quaelin',
			'http://www.linkedin.com/in/chriscampbell',
			'https://plus.google.com/u/0/102490484381514955957',
			'https://twitter.com/quaelin',
			'http://www.quora.com/Chris-Campbell'
		]
	;

	$(function () {
		a.set('body', $(document.body));
	});

	a.once('body', function (body) {
		body.append('<h1>Links</h1>');
		var ul = $('<ul></ul>').appendTo(body);
		each(urls, function (i, url) {
			ul.append('<li><a href="' + url + '" target="_new">' +
				url.replace(/https?:\/\//, '') + '</a></li>');
		});
	});

}(Frame));
