document.getElementById('save').addEventListener('click', function(){
    var token = document.getElementById('token').value;
    chrome.storage.sync.set({"token": token}, function(){
        document.getElementById("good").style.display = 'block';
        document.getElementById("token-container").style.display = 'none';
    });
});

document.getElementById("token").addEventListener("input", function(){
    document.getElementById("save").style.display = 'inline-block';
});
