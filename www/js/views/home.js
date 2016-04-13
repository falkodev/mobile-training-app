var home = function () {}

function startQuiz(el) {
	console.log('start ' + el.getAttribute('data-module'));
	displayView('quiz');
}
