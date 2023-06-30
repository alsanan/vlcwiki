// import from ''
const http = require('http');
const url = require('url');

const server= {

  httpserver: null,

  // rutas
  routes: {
    GET: [],
    POST: [],
    PUT: [],
    DELETE: [],
    PATCH: [],
  },

  // Función para registrar una ruta
  registerRoute(method, pathPattern, handler) {
    //const regexPattern = pathPattern.replace(/:[^/]+/g, '([^/]+)');
    const regexPattern = pathPattern
      .replace(/:[^/]+/g, '([^/]+)')
      .replace(/\*/g, '(.*)'); // Añadir soporte para un número indeterminado de parámetros
    if (!Array.isArray(method)) method= [method]; // siempre array
    method.forEach(m=> this.routes[m].push({ regexPattern, pathPattern, handler }) );
  },

  // Función para manejar las solicitudes
  handleRequest(req, res) {
    const { method, url: reqUrl } = req;
    const pathname = new url.URL(reqUrl, `http://${req.headers.host}`).pathname;
    const searchParams= url.parse(req.url, true).query;
    // Obtener el enrutador correspondiente al método de solicitud
    const router = this.routes[method];
    // Verificar si existe una ruta registrada para el método y la URL solicitada
    if (router) {
      const matchedRoute = router.find(route => {
        const regex = new RegExp(`^${route.regexPattern}$`);
        return regex.test(pathname);
      });
      if (matchedRoute) {
        const handler = matchedRoute.handler;
        const params = this.extractParams(pathname, matchedRoute.pathPattern, matchedRoute.regexPattern);
        handler(req, res, params, searchParams);
        return;
      }
    }
    // Manejar rutas no encontradas
    res.statusCode = 404;
    rr= router.find(route => {
      const regex = new RegExp(`^${route.regexPattern}$`);
      console.log(route.regexPattern+' vs '+pathname)
      return regex.test(pathname);
    })
    console.log(JSON.stringify(rr))
    if (router) console.log(pathname)
    res.end('Not Found');
  },

  // Función para extraer los parámetros de la URL utilizando el patrón de ruta
  extractParams(pathname, pathPattern, regexPattern) {
    const paramNames = (pathPattern.match(/:[^/]+|\*/g) || []).map(param => param.slice(1) || 'rest');
    const regex = new RegExp(regexPattern);
    const match = pathname.match(regex);
    if (match) {
      const params = {};
      const paramValues = match.slice(1); // Obtener los valores de los parámetros
      for (let i = 0; i < paramNames.length; i++) {
        params[paramNames[i]] = paramValues[i];
      }
      return params;
    }
    return {};
  },

  servefile(filePath,req,res,params,query) {
    const path = require('path');
    const fs = require('fs');
    const abort=()=>{ throw "abort!"; }
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        const errorPath= path.join(__dirname, 'data', '404.html')//req.url);
        server.servefile(errorPath,req,res,params,{});
      } else {
        console.log('Serving '+filePath);
        const extname = path.extname(filePath);
        const contentType = this.getContentType(extname);
        if (extname === '.sjs' && filePath.indexOf('static')<0) { // sjs= server js
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          const script = data.toString();
          //try {
            const result = eval(script); // Ejecutar el archivo JS
          //} catch(e) { console.log(e); }
          if (typeof result==='string') res.end(result.toString());
        } else {
          res.writeHead(200, { 'Content-Type': contentType+'; charset=utf-8' });
          res.end(data);
        }
      }
    });
  },

  getContentType(extname) {
    switch (extname) {
      case '.html': return 'text/html';
      case '.css': return 'text/css';
      case '.js': return 'text/javascript';
      case '.png': return 'image/png';
      case '.webp': return 'image/webp';
      case '.jpg':
      case '.jpeg': return 'image/jpeg';
      case '.svg': return 'image/svg+xml';
      case '.gif': return 'image/gif';
      case '.bmp': return 'image/bmp';
      case '.ico': return 'image/x-icon';
      case '.txt': return 'text/plain';
      case '.csv': return 'text/csv';
      case '.html': return 'text/html';
      case '.json': return 'application/json';
      case '.xml': return 'application/xml';
      case '.pdf': return 'application/pdf';
      case '.doc': return 'application/msword';
      case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';    
      case '.xls': return 'application/vnd.ms-excel';
      case '.ppt': return 'application/vnd.ms-powerpoint';
      case '.zip': return 'application/zip';
      case '.mp3': return 'audio/mpeg';
      case '.wav': return 'audio/wav';
      case '.mp4': return 'video/mp4';
      case '.avi': return 'video/x-msvideo';
      case '.php': return 'application/x-httpd-php';
      default: return 'application/octet-stream';
    }
  },

  start() {
    // Crear el servidor HTTP
    this.httpserver = http.createServer(this.handleRequest.bind(this));
    // Obtener el puerto asignado por Heroku o usar el puerto 3000 de forma predeterminada
    const port = process.env.PORT || 80;
    // Escuchar en el puerto 80
    this.httpserver.listen(port, () => {
      console.log('Servidor web iniciado en el puerto '+port);
    });
  }

}

// _________________________________________________________________

server.registerRoute('GET', '/statics/*', (req, res, params) => server.servefile('c:/mega/web/'+params.rest,req,res,{},{}) );

// Ruta de ejemplo con parámetros
server.registerRoute('GET', '/saludo/:param1/:param2', (req, res, params, queryParams) => {
  const param1 = params.param1;
  const param2 = params.param2;
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Saludo con parametros: ${param1}, ${param2}`);
});

server.registerRoute('GET', '/test/*', (req, res, params, queryParams) => {
  const pathParams = params.rest.split('/'); // Obtener los parámetros separados
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Ejemplo con parametros: ${pathParams}`);
});

// Ruta de ejemplo con parámetros
server.registerRoute(['GET','POST'], '/:param1/*', (req, res, params, queryParams) => {
  const path = require('path');
  const param1 = params.param1;
  const filePath= path.join(__dirname, param1)//req.url);
  //res.writeHead(200, { 'Content-Type': 'text/plain' });
  server.servefile(filePath,req,res,params,queryParams);
});

[
  '/css.css',
  '/instant.page.js',
  '/wiki.js',
  '/crypt.js',
  '/menu.html',
  '/header.html',
  '/footer.html',
  '/zamalogo.svg',
  '/favicon.ico',
].forEach( rt=> {
  server.registerRoute('GET', rt, (req, res) => server.servefile('./static'+rt,req,res,{},{}) );
})
// Ruta principal
server.registerRoute('GET', '/', (req, res) => server.servefile('./data/index.html',req,res,{},{}) );

// Ruta con archivo en dir data
server.registerRoute('GET', '/:pagename', (req, res, params, queryParams) => {
  const fs = require('fs');
  const path = require('path');

  const pagename = params.pagename;
  console.log(req.method+' '+params.pagename)
  const filePath = path.join(__dirname, 'data', `${pagename}.html`);
  //const filePath= path.join(__dirname, pagename)//req.url);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // El archivo no existe
      res.writeHead(404, { 'Content-Type': 'text/html' });
      const errorPath= path.join(__dirname, 'data', '404.html')//req.url);
      server.servefile(errorPath,req,res,params,queryParams);
    } else {
      // El archivo existe, servirlo como respuesta
      server.servefile(filePath,req,res,params,queryParams);
    }
  });  
});

console.log(server.routes)

server.start();
