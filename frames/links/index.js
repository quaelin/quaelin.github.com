/*global Frame*/
(function (Frame) {
	var
		atom = Frame.atom,
		a = atom.create(),
		$ = Frame.jQuery,
		getScript = $.getScript
	;

	$(function () {
		$(document.body).append('Foo');
	});

}(Frame));
