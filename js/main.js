$(function() {
	bindMenu();
	var $activeNavLi = $('nav li.active').first();
	loadContent($activeNavLi.attr('data-link'));
});

function bindMenu() {
	$('nav li[data-link]').off('click').on('click', function() {
		var $navLi = $(this);
		$('nav li').removeClass('active');
		$navLi.addClass('active');
		loadContent($navLi.attr('data-link'));
	});
	$('#github').off('click').on('click', function() {
		window.open($(this).attr('data-link'),'_blank');
	});
}

function loadContent(link) {
	$.get(link, function(data) {
		$('#content').html(data).scrollTop(0).find('a').attr('target', '_blank');
		Highlight.run();
	});
}