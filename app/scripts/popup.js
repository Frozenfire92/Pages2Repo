//--- Start Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-63782941-1']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
//--- End Google Analytics

// Copies str to the clipboard (newest versions of chrome only I think)
function copy(str, mimetype) {
    // console.log('copy', str, mimetype);
    document.oncopy = function(event) {
        event.clipboardData.setData(mimetype, str);
        event.preventDefault();
    };
    document.execCommand("Copy", false, null);
}

// Makes a number readable with K/M appended
function readableNumber(number){
    if (number >= 10000 && number < 1000000){ return Math.floor(number / 1000) + "K"; }
    else if (number >= 1000000){ return (number / 1000000).toFixed(1) + "M"; }
    else return number.toLocaleString();
}

window.onload = getInfoFromStorage;

function getInfoFromStorage(){
    // Get title for current tab and find corresponding repo info from storage
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs){
        var currentTab = tabs[0];

        chrome.pageAction.getTitle({
            tabId: currentTab.id,
        }, function(title){
            var storageKey = title.toLowerCase().replace(/(\.|\/)/g,'_');
            chrome.storage.local.get(storageKey, function(data){
                // console.log('repo info from popup', data);

                // Set properties on elements
                document.getElementById("pages-2-repo-fullrepo").innerHTML = data[storageKey].full_name;
                document.getElementById("pages-2-repo-description").innerHTML = data[storageKey].description;
                document.getElementById("pages-2-repo-stars").innerHTML = readableNumber(data[storageKey].stars);
                document.getElementById("pages-2-repo-watchers").innerHTML = readableNumber(data[storageKey].watchers);
                document.getElementById("pages-2-repo-forks").innerHTML = readableNumber(data[storageKey].forks);
                document.getElementById("pages-2-repo-issues").innerHTML = readableNumber(data[storageKey].issues);
                document.getElementById("pages-2-repo-image").setAttribute("src", data[storageKey].image);

                // Set links
                document.getElementById("profile-link").setAttribute("href", data[storageKey].owner_url);
                document.getElementById("repo-link").setAttribute("href", data[storageKey].url);
                document.getElementById("star-link").setAttribute("href", data[storageKey].url + "/stargazers");
                document.getElementById("watch-link").setAttribute("href", data[storageKey].url + "/watchers");
                document.getElementById("fork-link").setAttribute("href", data[storageKey].url + "/network");
                document.getElementById("issue-link").setAttribute("href", data[storageKey].url + "/issues");

                // Clone button listeners
                document.getElementById("ssh-link").addEventListener('click', function(){
                    copy(data[storageKey].ssh, "text/plain");
                    _gaq.push(['_trackEvent', 'SSH Clone', data[storageKey].full_name]);
                });
                document.getElementById("https-link").addEventListener('click', function(){
                    copy(data[storageKey].https, "text/plain");
                    _gaq.push(['_trackEvent', 'HTTPS Clone', data[storageKey].full_name]);
                });

                // Stop loading animation and show content
                document.getElementById("pages-2-repo-content").style.display = 'block';
                document.getElementById("pages-2-repo-loader").style.display = 'none';
            });
        });
    });
}
