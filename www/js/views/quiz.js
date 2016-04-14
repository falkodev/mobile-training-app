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

// ask the engine a new question and retrieve elements for answer
function nextQuestion() {
	// when displaying new question, hide button "next" and previous explanation
	this.hideElements();

	this.alreadyClicked = false;
	
	let guidQuestion = this.engine.nextExerciseGuid();
	// console.log('guidQuestion:' + guidQuestion)
	// guidQuestion = null;
	if(guidQuestion) {
		$('#nextQuestionButton').attr('guid', guidQuestion);
		$('#nextQuestionButton').removeClass('hidden');

		// var nextQuestionButton = document.getElementById('nextQuestionButton');
	 //  	nextQuestionButton.setAttribute('guid', guidQuestion);

		this.getElementsFromObj(this.jsonObj, guidQuestion, this.questionProps); 

		this.readNestedObj(this.questionProps); //useful if need to display in console what questionProps object contains

		// define canvas to display image
		var imgCanvas = document.getElementById('imgCanvas');
	  	// imgCanvas.width  = this.questionProps['image']['width'];
	  	// imgCanvas.height = this.questionProps['image']['height'];
	  	imgCanvas.setAttribute('width',this.questionProps['image']['width']);
	  	imgCanvas.setAttribute('height',this.questionProps['image']['height']);
	  	let context      = imgCanvas.getContext('2d');

	  	// add image to canvas
		let quizImage = new Image();
		quizImage.src = 'assets/modules/' + this.questionProps['image']['url'];
		quizImage.onload = function(){ //draw image when picture loaded
			context.drawImage(quizImage, 0, 0);
	  	}

	  	// attach guid to "next" button
	  	var nextQuestionButton = document.getElementById('nextQuestionButton');
	  	nextQuestionButton.setAttribute('guid', guidQuestion);
	  	this.endedByEngine = false;
  	} else  {
  		var quitQuizButton = document.getElementById('quitQuizButton');
  		quitQuizButton.innerHTML = "Module terminé";
  		this.endedByEngine = true;
  	}
}

// used for test : read props extracted from json
function readNestedObj(obj){
	for(let prop in obj) {
    	console.log('prop:' + prop + ' value:' + obj[prop]);
    	if(obj[prop] instanceof Object) { 
    		this.readNestedObj(obj[prop]);
    	}
    }
}

// get elements used to display question and check answer
function getElementsFromObj(obj, id, props) {
    for(let prop in obj) {
    	if(obj[prop] instanceof Object) { 
    		this.getElementsFromObj(obj[prop], id, props);
    	} else {
    		if(obj[prop] === id) {
				props['type']         = obj['type'];
				props['explanation']  = obj['explanation'];
				props['image']        = obj['image'];
				props['polygoneList'] = obj['polygoneList'];
    			return;
    		}
    	}
    }
}

// hide button "next" and previous explanation
function hideElements() {
	// nextQuestionButton.hidden = true;
	// answerExplanation.innerHTML = '';
	this.answerStatus = this.NO_ANSWER;
}

loadAjax('assets/modules/module.json', function(response) {
	returnJSON = JSON.parse(response);
	console.log('returnJSON: ' + returnJSON);
	var inst = new quiz();
	
	this.questionProps  = {};
	this.jsonObj        = {};
	this.alreadyClicked = false; //allow only one click
	this.engineBuilder = new com.woonoz.engine.js.JsEngineBuilder();
	this.engineBuilder.init(false, 4);	

	this.jsonObj = returnJSON;

	let chapters = this.jsonObj['chapters'];
	for(let chapter in chapters) {
		this.engineBuilder.addChapter(chapters[chapter]['guid']);
		let currentChapter = chapters[chapter];
		let subChapters = currentChapter['subChapters'];
		for(let subChapter in subChapters) {
			this.engineBuilder.addSubChapter(subChapters[subChapter]['guid']);
			let currentSubChapter = subChapters[subChapter];
			let exercises = currentSubChapter['exercises'];
			for(let exercise in exercises) {
				this.engineBuilder.addExerciseToCurrentChapter(exercises[exercise]['guid']);
			}
		}
	}
	this.engine = this.engineBuilder.createEngine();
	this.nextQuestion();

	console.log('this.NO_ANSWER: ' + inst.NO_ANSWER);
});