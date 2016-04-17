var home = function () {
	
	var moduleArr = [];
	$.ajax({
	    url: 'assets/modules/modules_list.txt',
	    async: false,
	    complete: function(data)
	    {
	      $.each(data, function(k,v){
	          if(k === 'responseText') {
	            modulesList = v.split("\n");
	            // console.log('modulesList: ' + modulesList)
	            $.each(modulesList, function(key,value){
	            	if(value) { //if value is not empty (new line in modules_list.txt)
						var modules = {};
						modules.id  = value;
		            	loadAjax('assets/modules/' + value + '/module.json', function(response) {
							jsonObj             = JSON.parse(response);
							modules.img         = 'assets/modules/' + value + '/' + jsonObj['icon'];
							modules.name        = jsonObj['name'];
							modules.description = jsonObj['description'];
						});
		            	moduleArr.push(modules);
		            	// console.log('moduleArr: ' + modules.id)
		            }
	            })
	          }
	      });
	    }
  	});

	var result = {
	  module: moduleArr, 
	  footer: [footer],
	};
	return result;
}

function startQuiz(el) {
	// console.log('start ' + el.getAttribute('data-module'));
	window.moduleId = el.getAttribute('data-module');
	displayView('quiz');
}
