<?php

if ($_REQUEST['new']) :
	$new= $_REQUEST['new'];
	if (file_exists('data/'.$new.'.html')) error('ya existe '.$new);
	file_put_contents('data/'.$new.'.html','<link rel="stylesheet" type="text/css" href="/css.css" />'."\n".'<script defer src="/wiki.js"></script>'."\n...");
	header('location: /'.$new);
	exit;
endif;

@extract(json_decode(file_get_contents('php://input'),true));

if (!empty($content)) { // guardar
	//if ($id=='404') die($content);
	if (file_exists('data/'.$id.'.html')) {
		$zip = new ZipArchive();
		if ($zip->open('data/'.$id.'.zip')!==TRUE) {
			$zip->open('data/'.$id.'.zip',ZIPARCHIVE::CREATE);
		}
		$zip->addFromString(date('YmdHis').'.html', file_get_contents('data/'.$id.'.html'));
	}
	file_put_contents('data/'.$id.'.html','<link rel="stylesheet" type="text/css" href="/css.css" />'."\n".'<script defer '.($crypted?'crypted':'').' src="/wiki.js"></script><script src="instant.page.js" type="module"></script>'."\n".$content);
	//if(substr($_REQUEST['content'],-4)=='----') die('<html><head><meta http-equiv="refresh"  content="0; url=/'.$id.'" /><body><script>location="'.$id.'";</script></body></html>');//header('location: '.$id);
	echo $_REQUEST['content'];
	exit;
}
if($_SERVER['QUERY_STRING']=='list' || $_REQUEST['list']=='date') :
	echo '<style>@import url(css.css);</style>';
	echo '<ul class="listpage">';
	$list= [];
	$pages= glob("data/*.html"/*, GLOB_ONLYDIR*/);
	if ( $_REQUEST['list']=='date' ) usort($pages, create_function('$a,$b', 'return filemtime($b) - filemtime($a);'));
	foreach($pages as $fn) :
		$_= basename($fn,'.html');
		$f= file_get_contents($fn);
		preg_match_all("|\[\[([^\]]+)\]\]|U",
	    	$f,
	    	$out, PREG_PATTERN_ORDER);
		$child= [];
		if ($out[1])
			foreach($out[1] as $link) :
				$link= strip_tags($link);
				if (substr($link,0,4)!='http')
					array_push($child,strToLower($link)); 
			endforeach;
		$list[strToLower($_)]= $child==[] ? null : $child;
		echo '<li><a href="',$_,'">',$_,'</a>';
		if ($child!=[]) echo '<sub>',implode(' | ',array_values($child)),'</sub>';
		echo '</li>';
	endforeach;
	/*
	?>
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
	echo '</ul>';
	exit;
endif;
if ($_REQUEST['search']) :
	$s= $_REQUEST['search'];
	echo '<style>@import url(css.css);</style>';
	echo '<h1>Resultados de "',$s,'"</h1>';
	echo '<ul class="listpage">';
	foreach(glob("data/*.html"/*, GLOB_ONLYDIR*/) as $fn) :
		$f= file_get_contents($fn);
		$pos= strpos($f, $s);
		if ( $pos!==false )	echo '<li><a href="',basename($fn,'.html'),'">',basename($fn,'.html'),'</a></li>';
	endforeach;
	exit;
endif;
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