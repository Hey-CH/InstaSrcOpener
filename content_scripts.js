var srcs=new Array();

//ページを移動したらsrcsをリセット
var lochref=document.location.href;
setInterval(function(){
	if(lochref!=document.location.href){
		srcs=new Array();
		lochref=document.location.href;
	}
},500);

//role='presentation'のarticle要素がなくなったらsrcsをリセット
$("body").click(function(){
	if(!$("article[role='presentation']").length){
		srcs=new Array();
	}
});
//_6CZjiボタンを押した時に新しく表示されたsrcを取得
$("body").on("click","button[class*='_6CZji']",function(){
	setTimeout(function(){
		var art=getPresentationArticle();
		if(art){
			srcs=serarchFirstUlSrc(art,srcs);
		}
	},500);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.text == "InstaSrcOpener") {
		if(isStories()){
			srcs=new Array();
			srcs.push(getCurrentStoriesSrc());
			sendResponse({ "url": srcs });
		}
		var art=getPresentationArticle();
		if(art){
			//ulがある場合、その中のvideo要素のsrc属性とimg要素のsrcset要素の最後の奴（,で区切った後 で区切り、最初の物がURL）
			srcs=serarchFirstUlSrc(art,srcs);
			if(srcs.length>0){
				//srcs=searchNextSrc(srcs);//機能しないのでコメント
				sendResponse({ "url": srcs });
			}
			
			//videoの場合（1個だけ）
			var video=art.getElementsByTagName("video");
			if(video.length>0){
				sendResponse({ "url": [video[0].getAttribute("src")] });
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

//class属性に「y-yJ5」を含む要素がある場合ストーリーズと判定します。
function isStories(){
	if($("*[class*='y-yJ5']").length){
		return true;
	}else{
		return false;
	}
}
//現在表示中のストリーズのsrcを返します
function getCurrentStoriesSrc(){
	if($("video[class*='y-yJ5']").length){//videoの場合
		return $("video[class*='y-yJ5']:first").children("source").attr("src");
	}else if($("img[class*='y-yJ5']").length){//imgの場合
		return $("img[class*='y-yJ5']:first").attr("src");
	}else{
		return "";
	}
}

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

function searchNextSrc(arr){
	var btn=get_6CZjiButton();
	if(btn){
		btn.click();
		//クリック後の一連の処理の後↓を実行したいがダメぽ
		arr=serarchFirstUlSrc(arr);
		arr=searchNextSrc(arr);
		//jQuery使えば行けるかと思ったけどだめだった。
		//$(btn).trigger("click",function(){
		//	arr=serarchFirstUlSrc(arr);
		//	arr=searchNextSrc(arr);
		//});
	}
	return arr;
}

function serarchFirstUlSrc(art,arr){
	var ul=art.getElementsByTagName("ul");
	if(ul.length>0){
		//img要素のsrc取得（srcset属性から抽出）
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
		//video要素のsrc取得（src属性そのまま）
		var ulvideo=ul[0].getElementsByTagName("video");
		if(ulvideo.length>0){
			for(var i=0;i<ulvideo.length;i++){
				var src=ulvideo[i].getAttribute("src");
				if(!arr.includes(src)){
					arr.push(src);
				}
			}
		}
	}
	return arr;
}