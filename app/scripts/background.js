'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
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

            //Set the title of the page action
            chrome.pageAction.setTitle({
                tabId: tabId,
                title: "github.com/"+userRepoObj.username+"/"+userRepoObj.repo
            });

            //Enable the page action button
            chrome.pageAction.show(tabId);
        }
    }
});
