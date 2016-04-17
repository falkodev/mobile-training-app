var quiz = function () {
	this.GOOD_ERROR     = 1;
	this.GOOD_NOERROR   = 2;
	this.BAD_ERROR      = 3;
	this.BAD_NOERROR    = 4;
	this.BAD_WRONGERROR = 5;
	this.NO_ANSWER      = 100;
}

// ask the engine a new question and retrieve elements for answer
function nextQuestion() {
	// when displaying new question, hide button "next" and previous explanation
	this.hideElements();
	this.alreadyClicked = false;
	noErrorButton.hidden = false;

	var guidQuestion = this.engine.nextExerciseGuid();
	if(guidQuestion) {	  
		this.getElementsFromObj(this.jsonObj, guidQuestion, this.questionProps); 

		// this.readNestedObj(this.questionProps); //useful if need to display in console what questionProps object contains

		// define canvas to display image
	  	imgCanvas.width  = this.questionProps['image']['width'];
	  	imgCanvas.height = this.questionProps['image']['height'];;
	  	var context      = imgCanvas.getContext('2d');

	  	// add image to canvas
		var quizImage = new Image();
		quizImage.src = 'assets/modules/' + window.moduleId +'/' + this.questionProps['image']['url'];
		quizImage.onload = function(){ //draw image when picture loaded
			context.drawImage(quizImage, 0, 0);
	  	}

	  	// attach guid to "next" button
	  	nextQuestionButton.setAttribute('guid', guidQuestion);
	  	this.endedByEngine = false;
  	} else  {
  		quitQuizButton.innerHTML = "Module terminé";
  		this.endedByEngine = true;
  	}

	// cheat mode
	if(this.jsonObj['cheatMode']) {
		cheatCorrectButton.hidden = false;
		cheatWrongButton.hidden   = false;
	}
}

// used for test : read props extracted from json
function readNestedObj(obj){
	for(var prop in obj) {
    	console.log('prop:' + prop + ' value:' + obj[prop]);
    	if(obj[prop] instanceof Object) { 
    		this.readNestedObj(obj[prop]);
    	}
    }
}

// get elements used to display question and check answer
function getElementsFromObj(obj, id, props) {
    for(var prop in obj) {
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
	nextQuestionButton.hidden = true;
	imgWrong.hidden = true;
	imgCorrect.hidden = true;
	answerExplanation.innerHTML = '';
	this.answerStatus = this.NO_ANSWER;
}

function onPageLoaded(response) {
	returnJSON = JSON.parse(response);
	
	this.questionProps  = {};
	this.jsonObj        = {};
	this.alreadyClicked = false; //allow only one click
	noErrorButton.hidden = false;

	this.engineBuilder = new com.woonoz.engine.js.JsEngineBuilder();
	this.engineBuilder.init(false, 4);	

	this.jsonObj = returnJSON;

	var chapters = this.jsonObj['chapters'];
	for(var chapter in chapters) {
		this.engineBuilder.addChapter(chapters[chapter]['guid']);
		var currentChapter = chapters[chapter];
		var subChapters = currentChapter['subChapters'];
		for(var subChapter in subChapters) {
			this.engineBuilder.addSubChapter(subChapters[subChapter]['guid']);
			var currentSubChapter = subChapters[subChapter];
			var exercises = currentSubChapter['exercises'];
			for(var exercise in exercises) {
				this.engineBuilder.addExerciseToCurrentChapter(exercises[exercise]['guid']);
			}
		}
	}
	this.engine = this.engineBuilder.createEngine();
	this.nextQuestion();
}

// draw pin where used clicked on image
function drawPin(context, posx, posy) {
    context.fillStyle = "#2FBDD5";
    context.beginPath();
    context.arc(posx, posy, 10, 0, 2*Math.PI);
    context.fill();
}

// return x and y coordinates for a click (or a tap on mobile device)
function getMousePos(e) {
    var rect = imgCanvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
}

// check if the image has an error
function hasError(){
	var polygoneList = this.questionProps['polygoneList'];
	return (!!polygoneList && polygoneList.length > 0);
}

//answer zone looks like:
// 3..........2
// .          .
// .          .
// .          .
// .          .
// .          .
// 0..........1
//verify if couple(x,y) is in answer zone defined by points 0 to 3
function checkIfClickIsInsideAnswerZone(x, y, point0x, point0y, point1x, point3y) {
	return (x >= point0x && x <= point1x && y >= point0y && y <= point3y);
}


function displayAnswer() {
	var context = imgCanvas.getContext('2d');
	for(var i = 0; i < this.questionProps.polygoneList.length; i++) {		
		var point0x = this.questionProps['polygoneList'][i]['points'][0]['x'];
		var point0y = this.questionProps['polygoneList'][i]['points'][0]['y'];
		var point1x = this.questionProps['polygoneList'][i]['points'][1]['x'];
		var point3y = this.questionProps['polygoneList'][i]['points'][3]['y'];
		var widthAnswerZone = point1x - point0x;
		var heigthAnswerZone = point3y - point0y;
		this.prepareAnswerZone(context);
		// setTimeout(() => {
		// 	context.clearRect(point0x, point0y, widthAnswerZone, heigthAnswerZone);
		// }, 500);
		context.clearRect(point0x, point0y, widthAnswerZone, heigthAnswerZone);
	}
}

//define color to use after user has answered in order to display the "correct answer" zone
function prepareAnswerZone(context) {
    context.fillStyle = "#2FBDD5";
}

function displayExplanation() {
	answerExplanation.innerHTML = this.questionProps['explanation'];
	noErrorButton.hidden = true;
	if(this.answerStatus === 1 || this.answerStatus === 2) {
		imgWrong.hidden   = true;
		imgCorrect.hidden = false;
	} else {
		imgWrong.hidden   = false;
		imgCorrect.hidden = true;
	}
}

function prepareNextAnswer(isLastAnswerGood) {
	// retrieve exercise guid
	var answeredGuid       = nextQuestionButton.getAttribute('guid');
	var interaction        = new com.woonoz.engine.js.JsEngineInteraction();
	interaction.init(answeredGuid, isLastAnswerGood);
	// send answer to engine
	this.engine.addInteraction(interaction);

	progression.innerHTML = this.engine.getProgression();
	nextQuestionButton.hidden = false;
}

// get click coordinates and check if it is in answer zone
function handleUserAnswer()
{
	// this.readNestedObj(this.questionProps);
	if(!this.alreadyClicked) { 
		this.alreadyClicked = true; //disable click while still on the same exercise

		var isGoodAnswer = false;

		// display user click
		var context = imgCanvas.getContext('2d');
		var e = window.event;
		var userClick = this.getMousePos(e);
		this.drawPin(context, userClick.x, userClick.y);

		if(this.hasError()) {
			for(var i = 0; i < this.questionProps.polygoneList.length; i++) {
				var point0y = this.questionProps['polygoneList'][i]['points'][0]['y'];
				var point1x = this.questionProps['polygoneList'][i]['points'][1]['x'];
				var point0x = this.questionProps['polygoneList'][i]['points'][0]['x'];
				var point3y = this.questionProps['polygoneList'][i]['points'][3]['y'];
				isGoodAnswer = this.checkIfClickIsInsideAnswerZone(userClick.x, userClick.y, point0x, point0y, point1x, point3y);
				if(isGoodAnswer) {
					break;
				}
			}
			this.answerStatus = isGoodAnswer ? this.GOOD_ERROR : this.BAD_WRONGERROR;
			this.displayAnswer();
		} else {
			this.answerStatus = this.BAD_NOERROR;
		}

		// change click area color
		if (isGoodAnswer) {
			context.fillStyle = "#3C763D";
		} else {
			context.fillStyle = "#A94442";
		}
		setTimeout(() => {
			context.fill();
		}, 500);

		this.displayExplanation();
		this.prepareNextAnswer(isGoodAnswer);
	}
}

// click on button no error
function noErrorClick() {
	if(!this.alreadyClicked) {
		this.alreadyClicked = true; //disable click while still on the same exercise
		var isGoodAnswer = true;
		if(this.hasError()) {
			isGoodAnswer = false;
			this.displayAnswer();
			this.answerStatus = this.BAD_ERROR;
		}
		else {
			this.answerStatus = this.GOOD_NOERROR;
		}
		this.prepareNextAnswer(isGoodAnswer);
		this.displayExplanation();
	}
}

function cheat(correct) {
	this.displayExplanation();
	this.prepareNextAnswer(correct);
	if(this.hasError()){
		this.answerStatus = correct ? this.GOOD_ERROR : this.BAD_ERROR;
		this.displayAnswer();
	}
	else {
		this.answerStatus = correct ? this.GOOD_NOERROR : this.BAD_NOERROR;
	}
	cheatCorrectButton.hidden = true;
	cheatWrongButton.hidden   = true;
}


// quit quiz and go to final page
function quitQuiz(endedByEngine) {
	this.hideElements();
	displayView('end');
    // this.nav.push(WoonozResultPage, {endedByEngine: endedByEngine});
}