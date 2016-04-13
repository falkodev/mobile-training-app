var quiz = function () {
	this.GOOD_ERROR = 1;
	this.GOOD_NOERROR = 2;
	this.BAD_ERROR = 3;
	this.BAD_NOERROR = 4;
	this.BAD_WRONGERROR = 5;
	this.NO_ANSWER = 100;
}

console.log('in quiz');

function loadAjax(file, callback) {
	var xobj = new XMLHttpRequest();
	xobj.open('GET', file, false);
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") {
			callback(xobj.responseText);
		}
	}
	xobj.send(null);
}

loadAjax('assets/modules/module.json', function(response) {
	returnJSON = JSON.parse(response);
	console.log('returnJSON: ' + returnJSON);
	var inst = new quiz();
	console.log('this.NO_ANSWER: ' + inst.NO_ANSWER);
});