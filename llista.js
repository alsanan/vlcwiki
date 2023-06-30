/*var r= [1,2,3,4,5]
r= [...r, ...params.rest.split('/').slice(1), ...query]
console.dir(r)
var html= `
${r.map(a=>`<li>${a}</li>`).join('')}
`

//res.write(html);
html;
*/

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
res.end(html);