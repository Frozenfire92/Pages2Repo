'use strict';

function copy(str, mimetype) {
  document.oncopy = function(event) {
    event.clipboardData.setData(mimetype, str);
    event.preventDefault();
  };
  document.execCommand("Copy", false, null);
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    console.log('tab', tabs);

    var urlObject = url.parse(tabs[0].url);

    var userRegex = /^(.*)?\.github\.io/i;
    var user = userRegex.exec(urlObject.host);

    var repoRegex = /^\/(.*?)\/.*/i;
    var repo = repoRegex.exec(urlObject.path);

    // document.getElementById("pages-2-repo-username").innerHTML = user[1];

    var username = user[1];
    var repository;

    if (repo) {
        repository = repo[1];
    } else {
        repository = user[1]+".github.io";
    }

    // Query github
    var request = new XMLHttpRequest();
    request.open('GET', 'https://api.github.com/repos/'+username+"/"+repository, true);

    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            var response = JSON.parse(this.response);
            // console.log('response', response);
            document.getElementById("pages-2-repo-fullrepo").innerHTML = response.full_name;
            document.getElementById("pages-2-repo-description").innerHTML = response.description;
            document.getElementById("pages-2-repo-stars").innerHTML = response.stargazers_count;
            document.getElementById("pages-2-repo-watchers").innerHTML = response.watchers;
            document.getElementById("pages-2-repo-forks").innerHTML = response.forks;
            document.getElementById("pages-2-repo-issues").innerHTML = response.open_issues;
            document.getElementById("pages-2-repo-image").setAttribute("src", response.owner.avatar_url);
            document.getElementById("pages-2-repo-content").style.display = 'block';
            document.getElementById("pages-2-repo-loader").style.display = 'none';
        } else {
            console.log('oh noes', this);
        }
    };

    request.onerror = function() {
        console.log('oh noes onerror', this);
    };

    request.send();
});
