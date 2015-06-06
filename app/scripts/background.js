'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details, details.previousVersion);

    // Clear local storage then get a new token
    chrome.storage.local.clear(function(){
        getToken();
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    // This may be called multiple times while loading the page, wait until completely loaded
    if (tab.status == "complete"){

        // Check for github pages
        var pagesRegex = /.*?\.github\.io/i;
        var isPage = pagesRegex.test(tab.url);

        if (isPage){
            // Get the username and repository from url
            var userRepoRegex = /http[s]?:\/\/([\da-zA-Z\-]*)?\.github\.io\/?([\da-zA-Z\-\.]*).*/i;
            var userRepo = userRepoRegex.exec(tab.url);
            var userRepoObj = {'username': userRepo[1], "repo": (userRepo[2]) ? userRepo[2] : userRepo[1] + ".github.io"};

            // console.log(userRepoObj);

            // Check localstorage if we already have this repo's info
            var storageKey = (userRepoObj.username + "_" + (userRepoObj.repo).replace(/(\.|\/)/g,'_')).toLowerCase();
            // console.log('storageKey', storageKey);
            chrome.storage.local.get(storageKey, function(data){
                // console.log('checking for existing repo info', data);
                // If we don't have this repos info
                if (!data.hasOwnProperty(storageKey)){
                    //Query repo
                    queryRepo(userRepoObj.username, userRepoObj.repo, tabId);
                }
                else { //Else we do have repos info
                    // If older than a day
                    if (Date.now() - data[storageKey].time_accessed >= 86400000){
                        console.log('old, reget info');
                        //Query repo
                        queryRepo(userRepoObj.username, userRepoObj.repo, tabId);
                    } else { // Else under a day old
                        // console.log('too new dont hit api');
                        //Set the title of the page action
                        chrome.pageAction.setTitle({
                            tabId: tabId,
                            title: data[storageKey].full_name
                        });
                        //Enable the page action button
                        chrome.pageAction.show(tabId);
                    }
                }
            });
        }
    }
});
