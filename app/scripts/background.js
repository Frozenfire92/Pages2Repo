'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);

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
            //Get the username and repository
            var userRepoRegex = /http[s]?:\/\/(.*)?\.github\.io\/?([a-zA-z\-]*).*/i;
            var userRepo = userRepoRegex.exec(tab.url);
            var userRepoObj = {'username': userRepo[1], "repo": (userRepo[2]) ? userRepo[2] : userRepo[1] + ".github.io"};

            console.log(userRepoObj);


            var storageKey = (userRepoObj.username + "_" + (userRepoObj.repo).replace(/(\.|\/)/g,'_')).toLowerCase();
            console.log('storageKey', storageKey);
            chrome.storage.local.get(storageKey, function(data){
                console.log('checking for existing repo info', data);
                if (!data.hasOwnProperty(storageKey)){
                    //Query repo
                    queryRepo(userRepoObj.username, userRepoObj.repo, tabId);
                }
                else {
                    if (Date.now() - data[storageKey].time_accessed >= 86400000){
                        console.log('old, reget info');
                        //Query repo
                        queryRepo(userRepoObj.username, userRepoObj.repo, tabId);
                    } else {
                        console.log('too new dont hit api');
                    }
                }

            });


        }
    }
});
