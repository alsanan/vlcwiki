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
    this.routes[method].push({ regexPattern, pathPattern, handler });
  },

  // Función para manejar las solicitudes
  handleRequest(req, res) {
    const { method, url: reqUrl } = req;
    const { pathname, searchParams } = new url.URL(reqUrl, `http://${req.headers.host}`);
    // Obtener el enrutador correspondiente al método de solicitud
console.dir(this.routes)
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

  servefile(filePath,res,params,query) {
    const path = require('path');
    const fs = require('fs');
    console.log(filePath);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Ruta no encontrada');
      } else {
        const extname = path.extname(filePath);
        const contentType = this.getContentType(extname);
        if (extname === '.js') {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          const script = data.toString();
          const result = eval(script); // Ejecutar el archivo JS
          if (typeof result==='string') res.end(result.toString());
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      }
    });
  },

  getContentType(extname) {
    switch (extname) {
      case '.html':
        return 'text/html';
      case '.css':
        return 'text/css';
      case '.js':
        return 'text/javascript';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  },

  start() {
    // Crear el servidor HTTP
    this.httpserver = http.createServer(this.handleRequest.bind(this));

    // Escuchar en el puerto 80
    this.httpserver.listen(80, () => {
      console.log('Servidor web iniciado en el puerto 80');
    });
  }

}

// _________________________________________________________________

// Ruta principal
server.registerRoute('GET', '/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('¡Hola, mundo!');
});

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
server.registerRoute('GET', '/:param1/*', (req, res, params, queryParams) => {
  const path = require('path');
  const param1 = params.param1;
  const filePath= path.join(__dirname, param1)//req.url);
  //res.writeHead(200, { 'Content-Type': 'text/plain' });
  server.servefile(filePath,res,params,queryParams);
});

console.log(server.routes)

server.start();
