import {Page, NavController} from 'ionic-angular';
import {WoonozResultPage} from '../result/result';

@Page({
  templateUrl: 'build/pages/woonoz/quiz/quiz.html'
})
export class WoonozQuizPage {
	static get parameters(){
		return [[NavController]];
	}
	constructor(nav){
		this.nav = nav;
		
		// values for answerStatus result
		this.GOOD_ERROR = 1;
		this.GOOD_NOERROR = 2;
		this.BAD_ERROR = 3;
		this.BAD_NOERROR = 4;
		this.BAD_WRONGERROR = 5;
		this.NO_ANSWER = 100;
  	}

  	//default ionic function : fire only once (see https://webcake.co/page-lifecycle-hooks-in-ionic-2/)
  	onPageLoaded() { 
		this.questionProps  = {};
		this.jsonObj        = {};
		this.alreadyClicked = false; //allow only one click

  		this.engineBuilder = new com.woonoz.engine.js.JsEngineBuilder();
  		this.engineBuilder.init(false, 4);	

		let returnJSON = this.jsonObj;
  		// json object
		this.loadAjax('build/resources/modules/module.json', function(response) {
			returnJSON = JSON.parse(response);
		});
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
		this.nextQuestion(); //call first question
    }

    // used for test : read props extracted from json
    readNestedObj(obj){
    	for(let prop in obj) {
	    	console.log('prop:' + prop + ' value:' + obj[prop]);
	    	if(obj[prop] instanceof Object) { 
	    		this.readNestedObj(obj[prop]);
	    	}
	    }
    }
    
    // get elements used to display question and check answer
    getElementsFromObj(obj, id, props) {
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

	// ask the engine a new question and retrieve elements for answer
	nextQuestion() {
		// when displaying new question, hide button "next" and previous explanation
		this.hideElements();

		this.alreadyClicked = false;
		
		let guidQuestion = this.engine.nextExerciseGuid();
		// guidQuestion = null;
		if(guidQuestion) {
			this.getElementsFromObj(this.jsonObj, guidQuestion, this.questionProps); 

			// this.readNestedObj(this.questionProps); //useful if need to display in console what questionProps object contains

			// define canvas to display image
		  	imgCanvas.width  = this.questionProps['image']['width'];
		  	imgCanvas.height = this.questionProps['image']['height'];
		  	let context      = imgCanvas.getContext('2d');

		  	// add image to canvas
			let quizImage = new Image();
			quizImage.src = 'build/resources/modules/' + this.questionProps['image']['url'];
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
	}

	// get click coordinates and check if it is in answer zone
	handleUserClick()
	{
		// this.readNestedObj(this.questionProps);
		if(!this.alreadyClicked) { 
			this.alreadyClicked = true; //disable click while still on the same exercise

			let isGoodAnswer = false;

			// display user click
			let context = imgCanvas.getContext('2d');
			let e = window.event;
			let userClick = this.getMousePos(e);
			this.drawPin(context, userClick.x, userClick.y);

			if(this.hasError()) {
				let point0x = this.questionProps['polygoneList'][0]['points'][0]['x'];
				let point0y = this.questionProps['polygoneList'][0]['points'][0]['y'];
				let point1x = this.questionProps['polygoneList'][0]['points'][1]['x'];
				let point3y = this.questionProps['polygoneList'][0]['points'][3]['y'];
				isGoodAnswer = this.checkIfClickIsInsideAnswerZone(userClick.x, userClick.y, point0x, point0y, point1x, point3y);
				this.answerStatus = isGoodAnswer ? this.GOOD_ERROR : this.BAD_WRONGERROR;
				this.displayAnswer();
			}
			else {
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
	noErrorClick() {
		if(!this.alreadyClicked) {
			this.alreadyClicked = true; //disable click while still on the same exercise
			let isGoodAnswer = true;
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

	// check if the image has an error
	hasError(){
		let polygoneList = this.questionProps['polygoneList'];
		return (!!polygoneList && polygoneList.length > 0);
	}

	displayAnswer() {
		let context = imgCanvas.getContext('2d');
		let point0x = this.questionProps['polygoneList'][0]['points'][0]['x'];
		let point0y = this.questionProps['polygoneList'][0]['points'][0]['y'];
		let point1x = this.questionProps['polygoneList'][0]['points'][1]['x'];
		let point3y = this.questionProps['polygoneList'][0]['points'][3]['y'];
		let widthAnswerZone = point1x - point0x;
		let heigthAnswerZone = point3y - point0y;
		this.prepareAnswerZone(context);

		setTimeout(() => {
			context.clearRect(point0x, point0y, widthAnswerZone, heigthAnswerZone);
		}, 500);
	}

	displayExplanation() {
		answerExplanation.innerHTML = this.questionProps['explanation'];
	}

	prepareNextAnswer(isLastAnswerGood) {
		// retrieve exercise guid
		let answeredGuid       = nextQuestionButton.getAttribute('guid');
		let interaction        = new com.woonoz.engine.js.JsEngineInteraction();
		interaction.init(answeredGuid, isLastAnswerGood);
		// send answer to engine
		this.engine.addInteraction(interaction);

		this.progression = this.engine.getProgression();
		nextQuestionButton.hidden = false;
	}

	// draw pin where used clicked on image
    drawPin(context, posx, posy) {
	    context.fillStyle = "#2FBDD5";
	    context.beginPath();
	    context.arc(posx, posy, 10, 0, 2*Math.PI);
	    context.fill();
	}

	//define color to use after user has answered in order to display the "correct answer" zone
	prepareAnswerZone(context, x, y, width, height) {
	    context.fillStyle = "#2FBDD5";
	}

	// return x and y coordinates for a click (or a tap on mobile device)
	getMousePos(e) {
	    let rect = imgCanvas.getBoundingClientRect();
	    return {
	      x: e.clientX - rect.left,
	      y: e.clientY - rect.top
	    };
	}

	// load requested file and call callback function afterwards
	loadAjax(file, callback) {
		let xobj = new XMLHttpRequest();
		xobj.open('GET', file, false);
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			}
		}
		xobj.send(null);
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
	checkIfClickIsInsideAnswerZone(x, y, point0x, point0y, point1x, point3y) {
		return (x >= point0x && x <= point1x && y >= point0y && y <= point3y);
	}


	// hide button "next" and previous explanation
	hideElements() {
		nextQuestionButton.hidden = true;
		answerExplanation.innerHTML = '';
		this.answerStatus = this.NO_ANSWER;
	}

	// quit quiz and go to final page
	quitQuiz(endedByEngine) {
		this.hideElements();
	    this.nav.push(WoonozResultPage, {endedByEngine: endedByEngine});
	}
}
