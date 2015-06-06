var client_id = "c5c34888e584fd777a12";
var client_secret = "9f03e925435870a9608c30294284cb96132a721f";
var redirectUri = chrome.identity.getRedirectURL("github");

function getToken(){
    // Check local storage for existing token
    chrome.storage.local.get("token", function(item){
        // No token, retrieve
        if (!item.hasOwnProperty('token')) {
            // Setup url to query
            var auth_url = "https://github.com/login/oauth/authorize?client_id="+client_id+
                           "&redirect_uri="+ encodeURIComponent(redirectUri) +
                           "&response_type=token";
            // Launch auth window
            chrome.identity.launchWebAuthFlow(
                {'url': auth_url, 'interactive': true},
                function(redirect_url) {
                    // chrome.identity.getRedirectURL(redirect_url);
                    // console.log('auth', redirect_url);
                    var codeRegex = /code=(.*)/i;
                    var code = codeRegex.exec(redirect_url);
                    // console.log('code', code[1]);

                    // Exchange our code for a token
                    var request = new XMLHttpRequest();
                    request.open('GET',
                             'https://github.com/login/oauth/access_token?' +
                             'client_id=' + client_id +
                             '&client_secret=' + client_secret +
                             '&redirect_uri=' + redirectUri +
                             '&code=' + code[1]);
                    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    request.setRequestHeader('Accept', 'application/json');
                    request.onload = function () {
                      if (this.status === 200) {
                        var response = JSON.parse(this.responseText);
                        console.log(response);

                        // If we got a token returned save to local storage
                        if (response.hasOwnProperty('access_token')) {
                            chrome.storage.local.set({"token": response.access_token});
                        } else {
                            console.log('no access token recieved');
                        }
                      } else {
                        console.log('code exchange status:', this.status);
                      }
                    };
                    request.send();
                }
            );
        }
        else { // Already have token, return
            return;
        }
    })
}

function queryRepo(username, repository, tabId){
    chrome.storage.local.get('token', function(data){
        var request = new XMLHttpRequest();
        request.open('GET', 'https://api.github.com/repos/'+username+"/"+repository+"?access_token="+data.token, true);

        request.onload = function() {
            if (this.status >= 200 && this.status < 400) {
                var response = JSON.parse(this.response);
                console.log('response repo', response);

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
                    https: response.html_url,
                    time_accessed: Date.now()
                };

                var repoObj = {};
                repoObj[full_name] = storageObj;
                console.log('repoObj', repoObj);

                //Save object and enable the page action button
                chrome.storage.local.set(repoObj, function(){
                    chrome.pageAction.show(tabId);
                });
            } else {
                console.log('Error retrieving repo info', this);
            }
        };

        request.onerror = function() {
            console.log('Error retrieving repo info', this);
        };

        request.send();
    });
}
