'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);

    var redirectUri = chrome.identity.getRedirectURL("github");
    console.log('redirect uri', redirectUri);

    var client_id = "c5c34888e584fd777a12";

    var auth_url = "https://github.com/login/oauth/authorize?client_id="+client_id+
         "&redirect_uri="+ encodeURIComponent(redirectUri) +
         "&response_type=token";

    chrome.identity.launchWebAuthFlow(
        {'url': auth_url, 'interactive': true},
        function(redirect_url) {
            chrome.identity.getRedirectURL(redirect_url);
            console.log('auth', redirect_url);
            var tokenRegex = /code=(.*)/i;
            var token = tokenRegex.exec(redirect_url);
            console.log('token', token[1]);
        }
    );
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
