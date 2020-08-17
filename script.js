var Helpers = Helpers || {};
Helpers.getImageData = function(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0,0,img.width, img.height);
};

angular.module('picross',[]).
value('IMG', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABM0lEQVQ4jZ3TMShucRjH8c+lJBlM6hIWZDKrq8hkFIuYLCajwSRlUDIYTCaDkgxKlMnAwDsZDWRTklDUvbd0Gc5zev/v6b3e8tRT5//7P7/v/zz/8xzKMYsL3OM5yZcv8iY3z+HjG/kPevEXJazgODYPsJjkdejriTYPG9hFY7zNQhSOqYwS3lBX0K2iJVlvBGA00ZrxiCs0FAFF4nYABhKtLfo9KZqrxVEA+hKtP7S9WuY62ad8R2uijwRgsxagSTYHd/Gcx1gA1moBemS9Xqi8m8kALNcCTEXhzn/0pa/MP5SHqHjSeOhbBX06Xcwoj+hkoXAo9CcMy2ZhCId5Qafs8j7wB90FwE+8xv5vXMrGfyUvmEhOP0V9lRZ3VP5ID+jKNztwjlsMVjFDO/bDeIZf8AnuRWPwxHM+WQAAAABJRU5ErkJggg==').
directive('ngLoad', function(){
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('load', function() {
        //call the function that was passed
        scope.$apply(attrs.ngLoad);
      });
    }
  }
}).
controller('Instructions', ['$scope',function($scope){
  // Moved the instructions here to keep the markup clean;
  $scope.showHelp = false;
  $scope.toggleHelpText = "Show Help";
  $scope.instructions  = [
    "A Nonogram is a puzzle game where the goal is to guess ",
    "what image is hidden behind a grid. The numbers around ",
    "the grid are the hints that can help you find which blocks ",
    "are black, and which are white. Each number tells you how many ",
    "continuous black blocks exist in this row or column.",
    "For example, if a row has the numbers 5 10 this means that ",
    "this row contains 5 black blocks in a row, 10 black blocks in a row and ANY number of white blocks between them.",
  ].join('');
  
  $scope.toggleHelp = function(){
    $scope.showHelp = !$scope.showHelp;
    $scope.toggleHelpText = $scope.showHelp?'Hide Help':'Show Help';
  };
}]).
controller('PicrossController', ['$scope','IMG',function($scope, IMG){
   
   $scope.grid = [];
   $scope.width  = 0;
   $scope.height = 0;
   $scope.src = IMG;
   $scope.rowCounters    = [];
   $scope.columnCounters = []; 
   $scope.getNumber = function(num) {
      return new Array(num);   
   }
   
   $scope.toggle = function(box){
     box.isSelected = !box.isSelected;
     
     // Check if the user won the game
     var won = true;
     $scope.grid.map(function(block){
       if(block.isSelected && !block.occupied){
         won = false;
       }
       
       if(!block.isSelected && block.occupied){
         won = false;
       }
     });
     if(won){alert('테스트 해 주셔서 감사합니다. 이 알림 까지 읽어야 합니다. 이렇게 생긴 돌을 입력해 주세요.');}
   }
   
   $scope.getGrid = function(){
      var data = Helpers.getImageData(document.querySelector('#img'));
      $scope.width = data.width;
      $scope.height = data.height;
      var char = 0;
      for(var i = 0, len = data.data.length; i < len; i+=4){
        if(data.data[i+3]){
          $scope.grid.push({occupied: 1});
        }else{
          $scope.grid.push({occupied: 0});
        }    
        char++;
      }
   };
  
  $scope.$watch('width', function(){
     $scope.rowCounters.length = 0;
     $scope.columnCounters.length = 0;
     Array.prototype.push.apply($scope.rowCounters, Array.apply(0, Array($scope.width)).map(function(){return [];}));
     Array.prototype.push.apply($scope.columnCounters, Array.apply(0, Array($scope.height)).map(function(){return [];}));
    
     // Go through all the rows of the image and count the batches
    
     $scope.rowCounters.map(function(row, index, rows){
       var batches = [], count = 0;
       for(var i = $scope.width*index, y = i; i < y + $scope.width; i++){
         if($scope.grid[i].occupied){
           ++count;
         }else if(count !== 0){
           batches.push({count: count}); count = 0;
         }
       }
       if(count){batches.push({count: count});}
       Array.prototype.push.apply(row, batches);
     });
    
    $scope.columnCounters.map(function(column, index, columns){
       var batches = [], count = 0;
       var x = index;
       for(var y = 0; y < $scope.height; y++){
        if($scope.grid[x + $scope.width*y].occupied){
           ++count;
         }else if(count !== 0){
           batches.push({count: count}); count = 0;
         }
       }
        
       if(count){batches.push({count: count});}
       Array.prototype.push.apply(column, batches);
     });
     
  });
}]);