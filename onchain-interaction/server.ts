const http = require('http');
const url = require('url');

import {pushConfig, fetchConfig} from './commonInteractions'


const server = http.createServer((req:any, res:any) => {
  if (req.method === 'POST') {
    const parsedUrl = url.parse(req.url, true);
    const { query } = parsedUrl;

    let body = '';
    req.on('data', (chunk:any) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      console.log(body);
      try {
        const data = JSON.parse(body);
        const temp = JSON.stringify(data);
        const tempfunc = async () =>{
            const val = await pushConfig(temp,"proton");
            console.log(val);
        }
        tempfunc();
        console.log('Received data:', data);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Data received successfully' }));
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON data' }));
      }
    });
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not supported' }));
  }
});

const port = 3008;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});