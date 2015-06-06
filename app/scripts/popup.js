'use strict';

function copy(str, mimetype) {
  document.oncopy = function(event) {
    event.clipboardData.setData(mimetype, str);
    event.preventDefault();
  };
  document.execCommand("Copy", false, null);
}

window.onload = getInfoFromStorage;

function getInfoFromStorage(){
    //Get title for current tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs){
        var currentTab = tabs[0];

        chrome.pageAction.getTitle({
            tabId: currentTab.id,
        }, function(title){
            var storageKey = title.toLowerCase().replace(/(\.|\/)/g,'_');
            chrome.storage.local.get(storageKey, function(data){
                console.log('repo info from popup', data);
                document.getElementById("pages-2-repo-fullrepo").innerHTML = data[storageKey].full_name;
                document.getElementById("pages-2-repo-description").innerHTML = data[storageKey].description;
                document.getElementById("pages-2-repo-stars").innerHTML = data[storageKey].stars;
                document.getElementById("pages-2-repo-watchers").innerHTML = data[storageKey].watchers;
                document.getElementById("pages-2-repo-forks").innerHTML = data[storageKey].forks;
                document.getElementById("pages-2-repo-issues").innerHTML = data[storageKey].issues;
                document.getElementById("pages-2-repo-image").setAttribute("src", data[storageKey].image);
                document.getElementById("pages-2-repo-content").style.display = 'block';
                document.getElementById("pages-2-repo-loader").style.display = 'none';
            });
        });
    });

}


//     // Query github
//     var request = new XMLHttpRequest();
//     request.open('GET', 'https://api.github.com/repos/'+username+"/"+repository, true);

//     request.onload = function() {
//         if (this.status >= 200 && this.status < 400) {
//             var response = JSON.parse(this.response);
//             // console.log('response', response);
//             document.getElementById("pages-2-repo-fullrepo").innerHTML = response.full_name;
//             document.getElementById("pages-2-repo-description").innerHTML = response.description;
//             document.getElementById("pages-2-repo-stars").innerHTML = response.stargazers_count;
//             document.getElementById("pages-2-repo-watchers").innerHTML = response.watchers;
//             document.getElementById("pages-2-repo-forks").innerHTML = response.forks;
//             document.getElementById("pages-2-repo-issues").innerHTML = response.open_issues;
//             document.getElementById("pages-2-repo-image").setAttribute("src", response.owner.avatar_url);
//             document.getElementById("pages-2-repo-content").style.display = 'block';
//             document.getElementById("pages-2-repo-loader").style.display = 'none';
//         } else {
//             console.log('oh noes', this);
//         }
//     };

//     request.onerror = function() {
//         console.log('oh noes onerror', this);
//     };

//     request.send();
// });
