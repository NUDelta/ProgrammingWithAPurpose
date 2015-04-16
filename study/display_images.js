var participants = [[['hu', 'liu', 'rodriguez', 'rovira', 'ruswick', 'vazquez'],
					 ['calloway', 'cook', 'miller', 'saxena', 'vaid'],
					 ['bhandari', 'kaldjian', 'paredes', 'wong']],
					[['bhandari', 'cook', 'miller', 'wong'],
					 ['calloway', 'kaldjian', 'paredes', 'rodriguez', 'rovira', 'vazquez'],
					 ['hu', 'liu', 'ruswick', '	saxena', 'vaid']],
					[['calloway', 'kaldjian', 'liu', 'paredes', 'saxena', 'vazquez'],
					 ['hu', 'ruswick', 'vaid', 'wong'],
					 ['cook', 'miller', 'rodriguez', 'rovira']]];

console.log(participants)


var goalFilepath, startFilepath, participantFilepath;

for (var i = 0; i < 3; i++) {
	for (var j = 0; j < 3; j++) {
		$('body').append('<h2>Mockup ' + (i+1) + '.' + (j+1) + '</h2><div class="' + (i+1) + (j+1) + ' mock-container"></div>');
		goalFilepath = 'images/' + (i+1) + (j+1) + '/' + (i+1) + (j+1) + 'goal';
		startFilepath = 'images/' + (i+1) + (j+1) + '/' + (i+1) + (j+1) + 'start';
		$('.'+(i+1)+(j+1)).append('<div class="img-container"><h4>Goal</h4><img src="' + goalFilepath + '.png" width="200"></div><br>');
		/*$('.'+i+j).append('<div class="img-container"><h4>Start</h4><img src="' + startFilepath + '.png" height="50"></div>');*/
		for (var k = 0; k < participants[i][j].length; k++) {
			participantFilepath = 'images/' + (i+1) + (j+1) + '/' + (i+1) + (j+1) + participants[i][j][k] + '.png';
   			$('.'+(i+1)+(j+1)).append('<div class="img-container"><h4>' + participants[i][j][k]+'</h4><img src="' + participantFilepath + '" width="200"></div>');
		}
	}
}

