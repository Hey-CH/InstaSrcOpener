var cmid;

chrome.tabs.onActiveChanged.addListener(function(id,info){
	setTimeout(() => {//Tabs cannot be edited right now (user may be dragging a tab)対応（完全に出なくなるわけではない）
		chrome.tabs.get(id,function(tab){
			if(tab){
				var url = tab.url;
				createOrDeleteInstaOpenMenu(url);
			}
		});
	}, 300);
});

chrome.tabs.onUpdated.addListener(function(id,info,tab){
	setTimeout(() => {//Tabs cannot be edited right now (user may be dragging a tab)対応（完全に出なくなるわけではない）
		if(tab && tab.active){
			var url = tab.url;
			createOrDeleteInstaOpenMenu(url);
		}
	}, 300);
});

//instagramを表示しているときだけコンテキストメニューを表示する
function createOrDeleteInstaOpenMenu(url){
	if(!cmid && url.startsWith("https://www.instagram.com/")){
		cmid = chrome.contextMenus.create({
			"title": "InstaOpen",
			"onclick": function () {
				instaOpen();
			}
		});
	}else if(cmid && !url.startsWith("https://www.instagram.com/")){
		chrome.contextMenus.remove(cmid);
		cmid=undefined;
	}
}

function instaOpen(){
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { text: "InstaSrcOpener" }, function (response) {
			for(var i=0;i<response.url.length;i++){
				//window.alert(response.url[i]);
				if(response.url[i].length>0 && !response.url[i].startsWith("blob:")){//blob:で始まる奴は未対応
					chrome.tabs.create({url: response.url[i]});
				}
			}
		});
	});
}