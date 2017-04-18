// our example model is just an Array
import {Client} from 'node-rest-client';
let client = new Client();
class sistemas {
  constructor(config) {
    this.config = config;
  }
  /*
  ** Private function to parse results from Neo4J
  ** params:
  ** data - data returned from Neo4J query
  ** return array of returned objects
  */
  _parseSistemas(data) {
    let results = data.results[0].data;
    let parsedResults = [];
    results.map((r)=>{
      if (!r.rest || r.rest.length != 1) return;
      let rData = r.rest[0].data;
      rData['id'] = r.rest[0].metadata.id;
      parsedResults.push(rData);
      return;
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
   * cb callback function (err, data)
   */
  _fetchResults(args, cb) {
    client.post(this.config.mapaInformacaoBaseUrl, args, (data, response) => {
      if (data.errors && data.errors.length > 0) {
        cb(data.errors);
      }
      else {
        if (!data.results || data.results.length != 1 || !data.results[0].data || data.results[0].data.length == 0) {
          return cb(null,{});
        }
        else {
          let parsedData = this._parseSistemas(data);
          cb(null,parsedData);
        }
      }
    }).on('error', (err) => {
      cb(err);
    });
  }
  /*
  ** Retrive all Sistema objects from Neo4J repository
  */
  getAll(cb) {
    let args = {
      data:{
        statements:[
          {
            statement:this.config.statements['allSistemas'],
            parameters:{s:0,l:10000},
            resultDataContents:["REST"]
          }
        ]
      },
      headers: {"Content-Type": "application/json"}
    }
    if (this.config.authentication != "") args.headers.Authorization = this.config.authentication;
    this._fetchResults(args,(err,data) => {
      cb(err,data);
    })
  }

  /**
   *
   * Get a sistema from mapa da informação Neo4J
   * params:
   * sistema
   * return an array of objects representing sistema
   *
   */
  getSistema(sistema, cb) {
    let statement = this.config.statements['oneSistema'].replace(/_SISTEMA_/g,sistema);
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

    this._fetchResults(args,(err,data) => {
      cb(err,data);
    })
  }

  /**
   *
   * Retrive all database users of a sistemas
   * params:
   * sistema - sistema name
   * return array of database users internal logins
   */
  getAllSistemaDbUsers(sistema, cb) {
    let statement = this.config.statements['allSistemaDBUsers'].replace(/_SISTEMA_/g,sistema);
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

    this._fetchResults(args,(err,data) => {
      cb(err,data);
    })
  }

  /*
  ** auxiliar function to set configurations
  */
  setConfig(config) {
    this.config = config;
  }
}
export default sistemas;

// const sistemas = [
//   {nome:'Sistema 1', id:'S1'},
//   {nome:'Sistema 2', id:'S2'},
//   {nome:'Sistema 3', id:'S3'}
// ];
// export default sistemas;
