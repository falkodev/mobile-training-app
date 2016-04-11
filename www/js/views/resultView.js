import {Page, NavController, NavParams} from 'ionic-angular';
import {WoonozHomePage} from '../home/home';

@Page({
  templateUrl: 'build/pages/woonoz/result/result.html'
})
export class WoonozResultPage {
	static get parameters(){
		return [[NavController], [NavParams]];
	}
	constructor(nav, navParams){
		this.nav       = nav;
		this.navParams = navParams;
  	}

  	onPageLoaded() {
  		let endedByEngine = this.navParams.get('endedByEngine');
  		if(!endedByEngine) {
  			endPhrase.innerHTML = "Vous avez quitté ce module avant de le terminer";
  		}
  	}

	goHome() {
	    this.nav.popToRoot();
	}
}
