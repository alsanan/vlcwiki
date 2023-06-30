/*
const fs = require('fs');
res.writeHead(200, { 'Content-Type': 'text/html' });
try {
    const fs = require('fs');
    const directorio= 'data';
    const archivos = fs.readdirSync(directorio);
    const archivosConFecha = archivos.map(archivo => {
        const pathCompleto = `${directorio}/${archivo}`;
        const stat = fs.statSync(pathCompleto);
        return {
            name: archivo,
            date: stat.mtime
        };
    });
    var html= fs.readFileSync('static/llistat.html', 'utf8');
    html+= ` 
      <script> 
        const files=${JSON.stringify(archivosConFecha)}
      </script>`;
} catch (err) {
    console.error('Error al leer el directorio:', err);
}
html;*/

//JSON.stringify(params)
//JSON.stringify(query)
//res.end(JSON.stringify(query) )

//throw "abort!"; // para salir de aqui

const headercontent= `<link rel="stylesheet" type="text/css" href="/css.css" />\n<script defer src="/instant.page.js"></script>\n<script defer src="/wiki.js"></script> \n
`;
params= params.rest.split('/');


// NEW FILE:
if (query.new!=undefined || params[0]=='new') {
	const fnew= query.new ?? params[1];
	if (fs.existsSync('data/'+fnew+'.html')) res.end('Ya existe! '+fnew),abort();
	fs.writeFileSync('data/'+fnew+'.html', headercontent+'...');
	res.writeHead(302, { 'Location': '/'+fnew })
	res.end();
}

// SEARCH:
if (query.search!=undefined || params[0]=='search') {
	console.log('Buscando '+query.search+params+'.')
	const search= query.search ?? params[1];
	res.writeHead(200, { 'Content-Type': 'text/html' });
	html= `<style>@import url(/css.css);</style> <h1>Resultados para ${search}</h1><ul>`;
	try {
		const directorio= 'data';
		var archivos = fs.readdirSync(directorio);
		archivos= archivos.filter(f=>{
			if (!fs.statSync(directorio+'/'+f).isFile()) return false;
			var ff= fs.readFileSync('data/'+f, 'utf8');
			return ff.indexOf(search)>=0;
		}).map(f=>`<li><a href="/${f.split('.')[0]}">${f.split('.')[0]}</a></li>`)
		res.end(html+archivos.join('')+'</ul>');
	} catch(e) { console.log(e); }
}

// VERSIONS:
if (query.versions!=undefined || params[0]=='versions') {
	const versions= query.versions ?? params[1];
	res.writeHead(200, { 'Content-Type': 'text/html' });
	html= `<style>@import url(/css.css);</style> <h1>Versiones de ${versions}</h1><h3>Pulsa sobre una versión para restaurarla</h3><a href="/${versions}">Volver</a><ul>`;
	try {
		const directorio= 'data/old';
		var archivos = fs.readdirSync(directorio);
		archivos= archivos.filter(f=>{
			if (!fs.statSync(directorio+'/'+f).isFile()) return false;
			return f.indexOf(versions)>0;
		}).map(f=>`<li><a href="/api.js/version/${f.split('.')[0]}">${f.split('.')[0]}</a></li>`)
		res.end(html+archivos.join('')+'</ul>');
	} catch(e) { console.log(e); }
}

// SAVE:
body='';
req.on('data', (chunk) => body += chunk );
req.on('end', () => {
	try {
		resp= (JSON.parse(body));
	} catch(e) { resp= {} }
	if (resp.content!=undefined) {
			// si existe muevo a old
			if ( fs.existsSync('data/'+resp.id+'.html') ) 
				fs.renameSync('data/'+resp.id+'.html', 'data/old/'+(new Date().toISOString().replace(/[TZ\/:\.]/g,''))+resp.id+'.html');
			fs.writeFileSync('data/'+resp.id+'.html', headercontent + resp.content );
			res.writeHead(302, { 'Location': '/'+resp.id+'?'+new Date().toISOString().replace(/[TZ\/:\.]/g,'') })
	} else {
		// Hacer algo con los datos recibidos
		res.statusCode = 200;
		res.end(resp?.id);
		//res.end('Datos recibidos correctamente');
	}

});





/*

if ($_REQUEST['versions']) :
	$_= $_REQUEST['versions'];
	echo '<style>@import url(css.css);</style>';
	if (!file_exists('data/'.$_.'.zip')) die('<h1>No existen versiones</h1>');
	$zip = new ZipArchive();
	if ($zip->open('data/'.$_.'.zip')!==TRUE) die('<h1>Error recuperando versiones</h1>');
	echo '<ul class="listpage">';
	for( $i = 0; $i < $zip->numFiles; $i++ ){
	    $stat = $zip->statIndex( $i );
	    $n= basename( $stat['name'],'.html' );
	    echo '<li><a href="api.php?version=',$_,'/',$n,'">',
	    	substr($n,6,2),'/',
	    	substr($n,4,2),'/',
	    	substr($n,0,4),' ',
	    	substr($n,8,2),':',
	    	substr($n,10,2),':',
	    	substr($n,12,2),
	    	'</a></li>';
	}
	echo '</ul>';
	exit;
endif;
if ($_REQUEST['version']) :
	$_= explode('/',$_REQUEST['version']);
	if (!file_exists('data/'.$_[0].'.zip')) die('<h1>No existen versiones</h1>');
	$zip = new ZipArchive();
	if ($zip->open('data/'.$_[0].'.zip')!==TRUE) die('<h1>Error recuperando versiones</h1>');
	echo str_replace('src="/wiki.js"','',$zip->getFromName($_[1].'.html'));
	echo '<style>@import url(css.css);</style>';
	exit;
endif;
function error($str) {
	?>
	<style>	@import url(css.css); div { width:100%; height:100%; } h1,div { place-items:center; display:grid; } </style>
	<div><h1><?=$str?></h1></div>
	<?php
	exit;
}
error('API error');

*/



/*
<style>#canvas {position: absolute;left: 0;top: 0;bottom: 0;right: 0;z-index: 1;}.node{color:#ff0 !important;}</style>
<script src="https://unpkg.com/cytoscape/dist/cytoscape.min.js"></script>
<!-- read https://js.cytoscape.org/ -->
<script>
document.addEventListener('DOMContentLoaded', function () {
	var cy = window.cy = cytoscape({
		container: document.getElementById('canvas'),
		elements: {
			nodes: [
				<?php
					$children=[];
					foreach($list as $elm=>$chld) :
						echo "{data:{id:'",str_replace(' ','',$elm),"'},classes:'node'},";
						if ($chld!=null) 
							$children[$elm]=$chld;
					endforeach;
				?>
				{ data: { id: '_' } }
			],
			edges: [
				<?php
					$count=0;
					foreach($children as $elm=>$chld)
						foreach($chld as $dst)
							if (in_array($dst,array_keys($list)))
							echo "{data:{id:'",($count++),"',source:'",str_replace(' ','',$elm),"',target:'",str_replace(' ','',$dst),"'}},";
				?>
				{ data: { id: '_', source: '_', target: '_' } }
			]
		},
		layout: {
			name: 'grid',
			//name: 'concentric',
			//concentric: function(n){ return 10*(n.id().substr(0,1).charCodeAt()-97); },
			//levelWidth: function(nodes){ return 20; },
			minNodeSpacing: 50
		},
	style: [ // the stylesheet for the graph
		{ 
			selector: 'node[id]',
			style: { 
				"content": "data(id)",
				"text-background-color": "#888",
				"text-border-color": "#f00",
				'text-valign': 'center',
				//"text-wrap": "wrap",
				//"text-max-width": 80,						
				'color': 'white',
				//'text-outline-width': 1,
				//'text-outline-color': '#000',
				'font-size': '7',
				'background-color': '#888'
			}
		},
		{
		  selector: 'edge',
		  style: {
			'width': 4,
			'line-color': '#f00',
			'target-arrow-color': '#f00',
			'target-arrow-shape': 'triangle',
			'curve-style': 'bezier'
		  }
		}
	],
	});
});
</script>			

<div id="canvas"></div>
<?php
*/
