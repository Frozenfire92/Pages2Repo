//--- Start Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-63782941-1']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
//--- End Google Analytics

chrome.runtime.onInstalled.addListener(function (details) {
    // Send update/install info to google
    if (details.previousVersion){ _gaq.push(['_trackEvent', 'Updated from', details.previousVersion]); }
    else { _gaq.push(['_trackEvent', 'Installed at', chrome.runtime.getManifest().version]); }

    chrome.storage.sync.get('token', function(token){
        // No token, retrieve
        if (!token.hasOwnProperty('token')){
            chrome.tabs.create({
                url: 'token.html'
            });
        }
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
                    queryRepo(userRepoObj.username, userRepoObj.repo, tabId);
                }
                else { //Else we do have repos info
                    // If older than a day
                    if (Date.now() - data[storageKey].time_accessed >= 86400000){
                        //Query repo
                        _gaq.push(['_trackEvent', 'Repo is old, update info', Date.now() - data[storageKey].time_accessed]);
                        queryRepo(userRepoObj.username, userRepoObj.repo, tabId);
                    } else { // Else under a day old
                        _gaq.push(['_trackEvent', 'Repo is fresh, keep info', data[storageKey].full_name]);
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
