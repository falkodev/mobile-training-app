var rateAppView = function () {

	/************************************** buttons behaviour **************************************/
	$('body').on('click', '#no', function(){
		sendData('-1', '#dashboard');
	});

	$('body').on('click', '#yes', function(){
		if (typeof MSApp !== 'undefined' && MSApp) { // windows app
          	sendData('1', 'ms-windows-store://review/?ProductId=9nblggh5kf28');
        } else { // android app
			sendData('1', 'market://details?id=com.toni.jwreading');
		}
	});

	$('body').on('click', '#later', function(){
		sendData('2', '#dashboard');
	});
	/************************************ end buttons behaviour ************************************/

	/**
	 * [sendData : save answer from user whether he wants to rate or not or later]
	 * @param  {[string]} user_rate_app_acceptance [values : no = -1, yes = 1, later = 2]
	 * @param  {[string]} location                 [where to redirect the user afterwards]
	 */
	function sendData(user_rate_app_acceptance, location){
		var d          = new Date();
		var datestring = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
		var data       = "user_rate_app_proposal_day=" + datestring + "&user_rate_app_acceptance=" + user_rate_app_acceptance + "&user_id=" + sessionUserData.id; 
		$.ajax({
			type:     'post',
			url :     'http://www.jwreading.com/ajax/saveData.php',
			data:     data,
			beforeSend:function(){
            	$('#buttonsRow').hide(); 
                $('#waitDiv').show(); 
            },
            timeout: 10000,
            complete: function(){
            	userData = JSON.parse(localStorage.getItem("sessionUserData"));
				var day         = new Date().getDate();
				var month       = new Date().getMonth();
				var year        = new Date().getFullYear();
				var currentDate = new Date(year, month, day);
            	userData.rateAppProposalDay = currentDate;
            	userData.rateAppAcceptance = user_rate_app_acceptance;
            	localStorage.setItem("sessionUserData", JSON.stringify(userData)); //update stored local user date 
            	$('#waitDiv').hide(); 
            	$('#backToHome').show(); 
            	if(location[0] === '#') {
            		window.location.hash = location;
            	} else {
            		window.open(location, '_blank', 'location=yes');
            	}
            }
        });
	}
}