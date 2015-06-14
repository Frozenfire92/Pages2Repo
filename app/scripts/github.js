//--- Start Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-63782941-1']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
//--- End Google Analytics

function queryRepo(username, repository, tabId){
    chrome.storage.local.get('token', function(token){
        // No token, retrieve
        if (!token.hasOwnProperty('token')){
            chrome.tabs.create({
                url: 'token.html'
            });
        }
        else { // Already have token, carry on
            var request = new XMLHttpRequest();
            request.open('GET', 'https://api.github.com/repos/'+username+"/"+repository+"?access_token="+token.token, true);

            request.onload = function() {
                if (this.status >= 200 && this.status < 400) {
                    var response = JSON.parse(this.response);
                    // console.log('response repo', response);

                    //Set the title of the page action
                    chrome.pageAction.setTitle({
                        tabId: tabId,
                        title: response.full_name
                    });

                    var full_name = ((response.full_name).toLowerCase()).replace(/(\.|\/)/g,'_');

                    var storageObj = {
                        full_name: response.full_name,
                        description: response.description,
                        stars: response.stargazers_count,
                        watchers: response.watchers,
                        forks: response.forks,
                        issues: response.open_issues,
                        image: response.owner.avatar_url,
                        ssh: response.ssh_url,
                        https: response.clone_url,
                        url: response.html_url,
                        owner_url: response.owner.html_url,
                        time_accessed: Date.now()
                    };

                    _gaq.push(['_trackEvent', 'queryRepo success', response.full_name]);

                    var repoObj = {};
                    repoObj[full_name] = storageObj;
                    // console.log('repoObj', repoObj);

                    //Save object and enable the page action button
                    chrome.storage.local.set(repoObj, function(){
                        chrome.pageAction.show(tabId);
                    });
                } else {
                    // console.log('Error retrieving repo info', this);
                    _gaq.push(['_trackEvent', 'queryRepo error', JSON.stringify(this)]);
                }
            };

            request.onerror = function() {
                // console.log('Error retrieving repo info', this);
                _gaq.push(['_trackEvent', 'queryRepo error', JSON.stringify(this)]);
            };

            request.send();
        }
    });
}
