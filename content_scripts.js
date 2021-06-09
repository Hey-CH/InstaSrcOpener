﻿chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.text == "InstaSrcOpener") {
		var art=getPresentationArticle();
		if(art){
			//videoの場合は1個だけ
			var video=art.getElementsByTagName("video");
			if(video.length>0){
				sendResponse({ "url": [video[0].getAttribute("src")] });
			}
			
			//ulがある場合、その中のimg要素のsrcset要素の最後の奴（,で区切った後 で区切り、最初の物がURL）
			var srcs=new Array();
			srcs=serarchFirstUlImg(art,srcs);
			if(srcs.length>0){
				//srcs=searchNextImg(srcs);//機能しないのでコメント
				sendResponse({ "url": srcs });
			}
			
			//videoでもul内のimgでもない場合、class="FFVAD"を持つ最初に出現する奴を返す
			var img=art.getElementsByTagName("img");
			if(img.length>0){
				for(var i=0;i<img.length;i++){
					var c=img[i].getAttribute("class");
					if(c=="FFVAD" && img[i].getAttribute("srcset")){
						var srcset=img[i].getAttribute("srcset");
						var sets=srcset.split(",");
						var src=sets[sets.length-1].split(" ")[0];
						sendResponse({ "url": [src] });
					}
				}
			}
		}
		
		sendResponse({ "url": [""] });
	}
});

//role属性値が「presentation」のarticle要素を返します
function getPresentationArticle(){
	var arts=document.getElementsByTagName("article");
	if(arts && arts.length>0){
		for(var i=0;i<arts.length;i++){
			var role=arts[i].getAttribute("role");
			if(role && role=="presentation"){
				return arts[i];
			}
		}
	}
	return null;
}

//class属性に「_6CZji」を含むbutton要素を返します
function get_6CZjiButton(){
	var bs=document.getElementsByTagName("button");
	if(bs.length>0){
		for(var i=0;i<bs.length;i++){
			var cls=bs[i].getAttribute("class");
			if(cls.includes("_6CZji")){
				return bs[i];
			}
		}
	}
}

function searchNextImg(arr){
	var btn=get_6CZjiButton();
	if(btn){
		btn.click();
		//クリック後の一連の処理の後↓を実行したいがダメぽ
		arr=serarchFirstUlImg(arr);
		arr=searchNextImg(arr);
		//jQuery使えば行けるかと思ったけどだめだった。
		//$(btn).trigger("click",function(){
		//	arr=serarchFirstUlImg(arr);
		//	arr=searchNextImg(arr);
		//});
	}
	return arr;
}

function serarchFirstUlImg(art,arr){
	var ul=art.getElementsByTagName("ul");
	if(ul.length>0){
		var ulimg=ul[0].getElementsByTagName("img");
		if(ulimg.length>0){
			for(var i=0;i<ulimg.length;i++){
				var srcset=ulimg[i].getAttribute("srcset");
				if(srcset){
					var sets=srcset.split(",");
					var src=sets[sets.length-1].split(" ")[0];
					if(!arr.includes(src)){
						arr.push(src);
					}
				}
			}
		}
	}
	return arr;
}