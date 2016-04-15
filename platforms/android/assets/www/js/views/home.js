var home = function () {
	var result = {
	  module: [
	    {id: 1, img: "assets/modules/module1/co_6f61ea32add7879a14c4d055c7f3e1ee.png"},
	    {id: 2, img: "assets/modules/module2/ae586e93-c454-44eb-a85c-9940369e7354_resize.png"},
	  ],
	  footer: [footer],
	};
	return result;
}

function startQuiz(el) {
	// console.log('start ' + el.getAttribute('data-module'));
	window.moduleId = el.getAttribute('data-module');
	displayView('quiz');
}
