// our example model is just an Array
import {Client} from 'node-rest-client';
let client = new Client();
class ModelBase {
  constructor(config) {
    this.config = config;
  }

  /*
  ** Private function to parse results from Neo4J
  ** params:
  ** data - data returned from Neo4J query
  ** return array of returned objects
  */
  _parseResults(data, parseFunction) {
    let results = data.results[0].data;
    let parsedResults = [];
    results.map((r)=>{
      if (parseFunction) parsedResults = parseFunction(r,parsedResults);
      else {
        if (!r.rest || r.rest.length != 1) return;
        let rData = r.rest[0].data;
        rData['id'] = r.rest[0].metadata.id;
        parsedResults.push(rData);
        return;
      }
    });
    return parsedResults;
  }

  /**
  *
  * fetch mapa da Informação Neo4J database results
  * params
  * args {
  *  data:{
  *  statements:[
  *     {
  *       statement:, -Query string
  *       parameters:{s:0,l:10000}, - Pagination params
  *       resultDataContents:["REST"] - Default result type
  *     }
  *   ]
  * },
  *  headers: {"Content-Type": "application/json"} - Default Content-Type
  * }
  * return a Promise to retrived data
  */
  _fetchResults(args, parseFunction) {
    let mapaInformacaoBaseUrl = this.config.mapaInformacaoBaseUrl;
    return new Promise( (resolve, reject) => {
      client.post(mapaInformacaoBaseUrl, args, (data, response) => {
        if (data.errors && data.errors.length > 0) {
          reject(data.errors);
        }
        else {
          if (!data.results || data.results.length != 1 || !data.results[0].data || data.results[0].data.length == 0) {
            resolve([]);
          }
          else {
            let parsedData = this._parseResults(data, parseFunction);
            resolve(parsedData);
          }
        }
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   *
   * Prepare arguments for query
   * params statement
   * return a prepared arg object
   */
   _getArguments(statement) {
     let args = {
       data:{
         statements:[
           {
             statement:statement,
             parameters:{s:0,l:10000},
             resultDataContents:["REST"]
           }
         ]
       },
       headers: {"Content-Type": "application/json"}
     }
     if (this.config.authentication != "") args.headers.Authorization = this.config.authentication;
     return args;
   }

  /*
  ** auxiliar function to set configurations
  */
  setConfig(config) {
    this.config = config;
  }
}
export default ModelBase;
