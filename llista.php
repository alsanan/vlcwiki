<?php

//include "../wiki/data/head.html";

$files= array();
$sem= array('D','L','M','X','J','V','S');
foreach (glob("./data/*.html") as $filename) {
	$time= filemtime($filename);
    $files[basename($filename,'.html')]= date('Y/m/d',$time).$sem[date('w',$time)].date(':H:i',$time);
}
foreach (glob("./data/*.txt") as $filename) {
	$time= filemtime($filename);
    $files[basename($filename,'.txt')]= date('Y/m/d',$time).$sem[date('w',$time)].date(':H:i',$time);
}
arsort($files);
?>

<div id="launcher" ondrop="drop(event)" ondragover="allowDrop(event)"><img style="width:" src="dragdrop.svg"/></div>

<table>
<thead>
<tr><td>Nom</td><td>Data</td></tr>
</thead>
<?php foreach($files as $file=>$date): ?> 
<tr><td><a target="_blank" draggable="true" ondragstart="drag(event)" href="#<?=$file?>"><?=utf8_encode($file)?></a></td><td><?=$date?></td></tr>
<?php endforeach; ?>
</table>


<style>
td { font: 1em "Lato", Segoe UI, sans-serif; }
td a { text-decoration:none; color:red;  }
tr > td:nth-child(1) { text-align:right; padding-right:20px !important; }
tbody > tr > td:nth-child(2) { font-size: 0.7em !important; }
thead { background:#fcc; }
table { border-spacing: 0px; border-collapse: separate; }
#launcher { position: fixed; left:10px; top:40px; width:30px; height:30px; }
</style>

<script>
function allowDrop(ev) { ev.preventDefault(); }

function drag(ev) { ev.dataTransfer.setData("text", ev.target.innerText); }

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    location.href=data;
}
</script>

<?php

//include "../wiki/data/foot.html";
