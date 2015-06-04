'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // console.log('onUpdate tab', tabId, changeInfo, tab);

    var urlObject = url.parse(tab.url);
    var pagesRegex = /.*?\.github\.io/i;
    var isPage = pagesRegex.test(urlObject.host);
    // console.log('is page', isPage, urlObject);

    if (isPage){

        var userRegex = /^(.*)?\.github\.io/i;
        var user = userRegex.exec(urlObject.host);

        var repoRegex = /^\/(.*?)\/.*/i;
        var repo = repoRegex.exec(urlObject.path);

        console.log({'username': user, "repo": repo});

        if (user && repo) {
            chrome.pageAction.setTitle({
                tabId: tabId,
                title: "github.com/"+user[1]+"/"+repo[1]
            });
        }

        else if (user && !repo) {
            chrome.pageAction.setTitle({
                tabId: tabId,
                title: "github.com/"+user[1]+"/"+user[1]+".github.io"
            });
        }

        chrome.pageAction.show(tabId);
    }
});
