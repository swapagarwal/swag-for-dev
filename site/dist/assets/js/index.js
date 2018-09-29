"use strict";var DATA_URL="https://raw.githubusercontent.com/swapagarwal/swag-for-dev/master/data.json",swagCache=void 0,contentEl=document.querySelector("#content"),filterInput=document.querySelector("#filter"),sortingInput=document.querySelector("#sorting"),fetchSwag=function(e){var t=new XMLHttpRequest;t.onreadystatechange=function(){if(4===this.readyState&&200===this.status){var n=t.responseText,i=JSON.parse(n);e(i)}},t.open("GET",DATA_URL,!0),t.send()},renderSwag=function(e){contentEl.innerHTML="",swagCache=e;var t=getFilter(),n=getSorting();e.filter(function(e){return"All difficulties"===t||e.difficulty===t.toLowerCase()}).sort(function(e,t){switch(n){case"Alphabetical":return e.name>t.name;case"Alphabetical, reversed":return e.name<t.name;case"Difficulty":return difficultyIndex(e.difficulty)>difficultyIndex(t.difficulty);case"Difficulty, reversed":return difficultyIndex(e.difficulty)<difficultyIndex(t.difficulty)}}).map(function(e){contentEl.innerHTML+="\n                <div class='item'>\n                    <div class='title flex'>\n                        <h1>"+e.name+"</h1>\n                        <div class='difficulty "+e.difficulty+"'></div>\n                    </div>\n                    <p class='swag'>Stickers</p>\n                    <div class='flex'>\n                        <img src='"+e.image+"'></img>\n                    </div>\n                    <p class='desciption'>"+e.description+"</p>\n                    <a href='"+e.reference+"'>Check it out</a>\n                </div>\n            "})},difficultyIndex=function(e){return["easy","medium","hard"].indexOf(e)},getFilter=function(){return filterInput.value},getSorting=function(){return sortingInput.value},attemptRender=function(){return void 0===swagCache?fetchSwag(renderSwag):renderSwag(swagCache)};window.addEventListener("load",function(){attemptRender(),filterInput.addEventListener("input",attemptRender),sortingInput.addEventListener("input",attemptRender)});