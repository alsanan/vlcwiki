//   var text = "Markdown *rocks*.";
//   http://showdownjs.com/
//   var converter = new Showdown.converter();
//   var html = converter.makeHtml(text);

// alternate for markdown https://marked.js.org/

// editor markdown online. estudiar https://app.markably.io/

//rehydrate header

const $= e=>document.querySelector(e);

var wiki= {

	editor: false,
	backup: '',
	name: '',
	converter: null,
	node: null,
	tea: null,
	crypted: false,
	
	dynamicallyLoadScript(url,fun) {
	    var script = document.createElement("script");  // create a script DOM node
	    script.src = url;  // set its src to the provided URL
	    script.addEventListener('load',fun)
	    //document.body.addEventListener('DOMContentLoaded',fun)
	    document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
	},

	edit(param) {
		if (!document.querySelector('#menu').__x.$data.auth) return wiki.doprompt();
		document.querySelector('#savebtn').classList.add('disablesave');
		if (param===false) {
			wiki.editor= false;
			console.log('off');
			wiki.node.setAttribute('contenteditable',false);	
			wiki.node.innerHTML= wiki.backup;
			wiki.toHtml();
			return;
		}
		if (wiki.editor) return false;
		//if (!wiki.checkCookie()) return;		
		if (!wiki.editor) document.getSelection().collapseToStart();
		document.querySelector('#savebtn').classList.remove('disablesave');
		wiki.editor= true;
		setTimeout(function() {
			wiki.backup= wiki.node.innerHTML;
		});
		wiki.toMD();
		wiki.node.setAttribute('contenteditable',true);
		wiki.node.focus();
	},

	save(restore=false,encrypted=false) {
		if ( restore===true ) return wiki.node.innerHTML= wiki.backup;
		wiki.toHtml();
		var data= wiki.node.innerHTML;
		//data= wiki.converter.makeMarkdown(wiki.node.innerText.replace(/(https?:\/\/[^\s]+)/g,'<a href="$1">$1</a>').replace(/\[\[([^\]]+)\]\]/g,'<a href="$1">$1</a>'));
		//wiki.node.innerHTML= data;
		data= data.replace(/^<p>/,'').replace(/<\/p>/g,'');
		fetch('api.php', {
			method:'post',
			body: JSON.stringify({ id: wiki.name, content: data, crypted: encrypted })
		} ).then( r=>console.log(r) );
		wiki.backup= data;
		wiki.editor= false;
		wiki.node.setAttribute('contenteditable', false);
		//$('#vis').innerHTML=(app.postprocess($('#vis').innerHTML));
		return false; // so the browser doesnt react to ctrl+s
	},

	crypt() {
		if (wiki.editor) return alert('No se puede en modo de edición. Guarda primero.');
		var br= String.fromCharCode(10);
		alert('Cuidado!!!!'+br+'Peligro!!!!'+br+'Se pedirá una clave de encriptación dos veces.'+br+'Esa clave NO se guarda en ningún sitio y por tanto es imposible de recuperar si se olvida.'+br+'Es imprescindible conocerla para acceder al contenido.');
		var key= prompt('Clave de encriptación');
		if (prompt('Repite la clave de encriptación')!=key) return alert('No coinciden');
		// ja tinc la clau, ara a encriptar contingut i guardar-lo
		//console.log(key,wiki.node.innerHTML,wiki.node.innerText,Tea.encrypt(wiki.node.innerHTML,key))
		wiki.node.innerHTML= Tea.encrypt('{crypt}'+wiki.node.innerHTML,key);
		wiki.save(false,true);
		document.querySelector('#key').value= key;
		wiki.recrypt(key);
	},

	recrypt(key) {
		wiki.node.classList.remove('decrypted');
		if (!key) {
			wiki.node.innerHTML=wiki.backup;
			console.log('na');
			return
		}
		//console.log(key)
		var data= Tea.decrypt(wiki.backup,key);
		if (data.substr(0,7)=='{crypt}') {
			data= data.substr(7);
			wiki.node.classList.add('decrypted');
		}
		wiki.node.innerHTML= data;
		//console.log(Tea.encrypt('søme highly secret text to be encrypteđ', 'encryptioñ-pw'),'D9959BObdYPHiSEjLvyMSFUnDPxlv8vqyI169gA3YIznWUmg88r4s0QnoUQ=')
		//console.log(Tea.decrypt('D9959BObdYPHiSEjLvyMSFUnDPxlv8vqyI169gA3YIznWUmg88r4s0QnoUQ=', 'encryptioñ-pw'),'søme highly secret text to be encrypteđ')
	},

	nodeScriptReplace(node) { 
		// necessite la seguent funcio per a executar els scripts inclosos en l'arxiu en el context de la finestra actual
		// https://stackoverflow.com/questions/1197575/can-scripts-be-inserted-with-innerhtml/20584396#20584396
		node.tagName === 'SCRIPT' ? eval(node.innerHTML) : node.childNodes.forEach( c=>nodeScriptReplace(c) ); 
	},

	toHtml() { 
		//console.log('de_md',wiki.node.innerText)
		wiki.node.innerHTML= wiki.converter.makeHtml(wiki.node.innerText).replace(/\[\[([^\]]+)\]\]/g,'[[<a href="$1">$1</a>]]');
		//console.log('a_html',wiki.node.innerHTML)
	},
	toMD() { 
		//console.log('de_html',wiki.node.innerHTML)
		wiki.node.innerText= 
			wiki.converter.makeMarkdown(
				wiki.node.innerHTML.replace(/\[\[\<a href="[^"]+">([^>]+)<\/a>\]\]/g,'[[$1]]')
			)
			.replace(/(^!)\[([^\]]+)\][^\)]+\)/g,'$1$2')
			.replace(/\<br\/?\>\n?\n?/gm,"\n")
			.replace(/[^][^]\<!-- --\>[^][^]/gm,"\n\n").trim();
		//wiki.node.innerText= wiki.node.innerText.replace(/\[([^\]]+)\]\(\<[^\>]+\>\)/g,'[[$1]]');
		//console.log('a_md',wiki.node.innerText)
	},
	
	clean() {
		if (!wiki.editor) return;
		wiki.node.innerText= wiki.node.innerText
			.replace(/\<br\/?\>\n\n/gm,"\n")
			.replace(/<img[^>]*src="([^"]+)"[^>]*>/gm,' ![]($1)')
			.replace(/\<a href="([^"]+)">/g,'[[$1]]')
			.replace(/\<\/a>/g,'')
			.replace(/&nbsp;/g," ")
			.replace(/<\/div>/g,"\n")
			.replace(/<\/p>/g,"\n")
			.replace(/<\/?[^>]+(>|$)/g, "")
			.replace(/\n\n+/g,"\n\n");
	},

	init() {
		if (document.body) {
			var htmlheader=`
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
			<title> ::wiki </title>
			<link rel="stylesheet" type="text/css" href="css.css" />
			`;
			document.head.innerHTML= htmlheader;
			wiki.crypted= document.querySelector('script[crypted]')!=null;
			var article= document.createElement('article');
			article.innerHTML= document.body.innerHTML;
			article.id= 'content';
			article.spellcheck= false;
			article.className='app';
			if(wiki.crypted) article.classList.add('crypted');
			document.body.innerHTML='';
			document.body.appendChild(article);
			document.body.insertAdjacentHTML('afterbegin','<header></header>');
			document.body.insertAdjacentHTML('beforeend','<footer></footer>');
			wiki.node= article;
			wiki.name= location.pathname.replace(/\//g,' ').trim().split(' ').pop();
			wiki.backup= wiki.node.innerHTML;

			var menu=document.createElement('iframe');
			menu.setAttribute('src', 'menu.html');
			menu.style.display='none';
			menu.addEventListener('load',(e)=>{menu.insertAdjacentHTML('afterEnd',e.target.contentDocument.body.innerHTML);});
			document.body.appendChild(menu);

			document.body.addEventListener('keypress',this.keyboard);
			document.body.addEventListener('keydown',this.keyboard);

			//document.body.addEventListener('dblclick', this.edit )
			let count=0; 
			let that= this;
			document.body.addEventListener('mouseup',e=>{ if (e.which==2) { count++; setTimeout(()=>{ if (count>1) { that.edit(e); e.preventDefault(); } count=0; }, 300 ); } } );
			document.body.addEventListener("paste", (e) => {
				// https://stackoverflow.com/questions/6899659/remove-formatting-from-a-contenteditable-div
		    	e.preventDefault();
		    	console.log(e.clipboardData.types)
				if (e.clipboardData.types.indexOf('text/html')>=0) {
					var paste= e.clipboardData.getData('text/html').replace(/<img/gi,'¬').replace(/(?:\r\n|\r|\n)/g,"§").replace(/<br\/?>|<\/p>|<\/h1>|<\/h2>/gi,"§").replace(/<li>/gi,"§- ");
					var text= paste.replace(/(<([^>]+)>)/ig, " ");
					text= text.replace(/\s+/g,' ').replace(/¬/g,'<img');
					console.log(text);
					text= text.replace(/(?:^[\s§]*|[\s§]*$)/g,"").replace(/(?:§\s§|§§|§)/g,"<br/>");
					console.log(text)
					text= text.replace(/<img[^>]*src="([^"]+)"[^>]*>/gm,'![](&lt;$1&gt;)');
					//text= text.replace(/^(\<br\/?\>)+/,'')
					//text= text.replace(/(\<br\/?\>)+$/,'');
					//var md= (wiki.converter.makeMd(e.clipboardData.getData('text/html')))
				} else text=e.clipboardData.getData('text/plain').replace(/(?:\r\n|\r|\n)/g,"<br/>");
		    	document.execCommand("insertHTML", false, text);
			});
			function copy (e) {
				//my20: afegeisc handler de copy per a copiar text pla al portaretalls i que es puga enganxar igual
				e.preventDefault();
			    e.clipboardData.setData("text/plain", e.clipboardData.getData("text/html"));
			    setTimeout(()=>{
					document.body.removeEventListener("copy", wiki.copy);
					document.execCommand("copy");
					document.body.addEventListener("copy", wiki.copy);
			    })

			}
			document.body.addEventListener("copy", wiki.copy);
		}
			//https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js
			this.dynamicallyLoadScript('https://rawgit.com/showdownjs/showdown/1.9.1/dist/showdown.min.js', ()=> {
				wiki.converter = new showdown.Converter({simpleLineBreaks:true,literalMidWordUnderscores:true,literalMidWordAsterisks:true, tables:true});
				wiki.converter.setFlavor('original');
				//wiki.toMD();
				//wiki.toHtml();
			} );
		this.dynamicallyLoadScript('crypt.js');
		this.dynamicallyLoadScript('https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.min.js');
	}, //init

	keyboard(e) {
		switch(e.which) {
			case 115:
			case 19:
			case 83:
				if (!e.ctrlKey) return true;
				e.preventDefault();
				wiki.save();
				return false;
			case 27:
				if (wiki.editor && confirm("Seguro?")) wiki.edit(false);
				break;
			default:
				return true;
		}
	},

	setCookie: function(cname, cvalue) {
		var d = new Date();
		d.setTime(d.getTime() + (1*24*60*60*1000)); // 1 dia
		var expires = "expires="+d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	}, 
	
	getCookie: function(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i<ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1);
			if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
		}
		return "";
	},

	doprompt: function() {
		var div= document.createElement('div');
		div.id= "alert";
		Object.assign( div.style, {
			position: 'fixed',
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			background:'linear-gradient(to right bottom, rgba(200,200,200,0.63) 0%, rgba(0,0,0,0.95)',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			transform: 'scale(1.5)',
		});
		var input= document.createElement('input');
		input.type="password";
		input.placeholder="password";
		div.append(input);
		var btn= document.createElement('button');
		btn.innerHTML= 'cancel'
		div.append(btn);
		document.body.append(div);
		var close=  e=> { 
			if(e && e.target && e.target.tagName=='INPUT') return;
			div.remove();
			return false; 
		}
		btn.addEventListener('click',close);
		div.addEventListener('click',close);
	},

	checkCookie:  function() {
		var username= wiki.getCookie("wiki4");
		var valids= {"\u006E\u0069\u006E\u0061\u0066\u006F\u006D\u0061\u006E\u0061\u0069\u0074\u0061":"rose"}; 
		var arr= Object.keys(valids).map( (key) => { return key; });
		if (!(username in valids)) {
			username=  wiki.doprompt()
			.then( name => {
				console.log(name);
				username= arr[0];
				if (username in valids) {
					wiki.setCookie("wiki4", arr[0]);
					//$('#btnexit').css('display','block');
					setTimeout(wiki.edit);
					document.querySelector('#menu').__x.$data.auth= true;
					return true;
				}
				else return false;
			} )
			.catch( a => { console.dir(a); alert('?catch'); } );
					return false;
        } else {
			document.querySelector('#menu').__x.$data.auth= true;
			//document.querySelector('#btnexit').css('display','block');
        	return true;
        }
		return false;
	}

} // wiki obj


wiki.init();
