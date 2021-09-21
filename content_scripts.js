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
				return;
			}
			
			var bdivs=getDivButtonSrcElements(art);
			if(bdivs.length>0){
				for(var i=0;i<bdivs.length;i++){
					if(bdivs[i].tagName=="IMG"){
						var cls=bdivs[i].getAttribute("class");
						if(cls!="FFVAD")continue;
					}
					/*srcsetから取得するの止めよう。（一番大きいのを調べないとダメだね）
					if(bdivs[i].hasAttribute("srcset")){
						var srcset=bdivs[i].getAttribute("srcset");
						var sets=srcset.split(",");
						var src=sets[sets.length-1].split(" ")[0];
						srcs.push(src);
					} else {
						srcs.push(bdivs[i].getAttribute("src"));
					}
					*/
					srcs.push(bdivs[i].getAttribute("src"));
				}
				sendResponse({ "url": srcs });
				return;
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
		//var ulimg=ul[0].getElementsByTagName("img");
		var ulimg=getDivButtonSrcElements(ul[0]);
		if(ulimg.length>0){
			for(var i=0;i<ulimg.length;i++){
				//img要素の場合class="FFVAD"が無いと追加対象から外す
				if(ulimg[i].tagName=="IMG"){
					var cls=ulimg[i].getAttribute("class");
					if(cls!="FFVAD")continue;
				}
				if(!arr.includes(ulimg[i].getAttribute("src")))arr.push(ulimg[i].getAttribute("src"));
			}
		}
	}
	return arr;
}
//parentの子孫にあるdiv role=button の子孫にあるsrc属性値を持つ要素を返します
function getDivButtonSrcElements(ele){
	var srceles=[];
	var divs=ele.getElementsByTagName("div");
	for(var i=0;i<divs.length;i++){
		var role=divs[i].getAttribute("role");
		if(role=="button"){
			var des=getDescendants(divs[i]);
			if(des.length>0){
				for(var j=0;j<des.length;j++){
					var src=des[j].getAttribute("src");
					if(src)srceles.push(des[j]);
				}
			}
		}
	}
	return srceles;
}
function getDescendants(ele){
	var arr=[];
	if(ele.children.length<=0)return arr;
	for(var i=0;i<ele.children.length;i++){
		arr.push(ele.children[i]);
		arr=arr.concat(getDescendants(ele.children[i]));
	}
	return arr;
}