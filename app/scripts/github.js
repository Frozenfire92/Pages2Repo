var client_id = "c5c34888e584fd777a12";
var client_secret = "9f03e925435870a9608c30294284cb96132a721f";
var redirectUri = chrome.identity.getRedirectURL("github");

//--- Start Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-63782941-1']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
//--- End Google Analytics

function getToken(){
    // Check local storage for existing token
    chrome.storage.local.get("token", function(token){
        // No token, retrieve
        if (!token.hasOwnProperty('token')) {
            // Setup url to query
            var auth_url = "https://github.com/login/oauth/authorize?client_id="+client_id+
                           "&redirect_uri="+ encodeURIComponent(redirectUri) +
                           "&response_type=token";
            // Launch auth window
            chrome.identity.launchWebAuthFlow(
                {'url': auth_url, 'interactive': true},
                function(redirect_url) {
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
                        // console.log(response);

                        // If we got a token returned save to local storage
                        if (response.hasOwnProperty('access_token')) {
                            _gaq.push(['_trackEvent', 'token recieved', 'getToken()']);
                            chrome.storage.local.set({"token": response.access_token}, function(){
                                document.getElementById("good").style.display = 'block';
                                document.getElementById("signin-container").style.display = 'none';
                            });
                        } else {
                            // console.log('no access token recieved');
                            _gaq.push(['_trackEvent', 'getToken no token recieved', JSON.stringify(this.status)]);
                            document.getElementById("error").style.display = 'block';
                            document.getElementById("signin-container").style.display = 'none';
                            window.setTimeout(function(){
                                document.getElementById("error").style.display = 'none';
                                document.getElementById("signin-container").style.display = 'block';
                            }, 3500);
                        }
                      } else {
                        // console.log('code exchange status:', this.status);
                        _gaq.push(['_trackEvent', 'getToken error', JSON.stringify(this.status)]);
                        document.getElementById("error").style.display = 'block';
                        document.getElementById("signin-container").style.display = 'none';
                        window.setTimeout(function(){
                            document.getElementById("error").style.display = 'none';
                            document.getElementById("signin-container").style.display = 'block';
                        }, 3500);
                      }
                    };
                    request.send();
                }
            );
        }
        else { // Already have token, return
            _gaq.push(['_trackEvent', 'Already had token', 'getToken()'])
            document.getElementById("good").style.display = 'block';
            document.getElementById("signin-container").style.display = 'none';
        }
    })
}

function queryRepo(username, repository, tabId){
    chrome.storage.local.get('token', function(token){
        // No token, retrieve
        if (!token.hasOwnProperty('token')){
            chrome.tabs.create({
                url: 'signin.html'
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
