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
  _parseSistemas(data, parseFunction) {
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
            resolve({});
          }
          else {
            let parsedData = this._parseSistemas(data, parseFunction);
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
  * Retrive all Sistema objects from Neo4J repository
  * return a Promise to retrived data
  */
  getAll() {
    let statement = this.config.statements['allSistemas'],
      args = this.getArguments(statement);
    return this._fetchResults(args);
  }

  /**
  *
  * Get a sistema from mapa da informação Neo4J
  * params:
  * sistema
  * return a Promise of an array of objects representing sistema
  *
  */
  getSistema(sistema) {
    let lwSistema = sistema.toLowerCase();
    let statement = this.config.statements['oneSistema'].replace(/_SISTEMA_/g,lwSistema),
      args = this.getArguments(statement);
    return this._fetchResults(args);
  }

  /**
  *
  * Retrive all database users of a sistemas
  * params:
  * sistema - sistema name
  * return a Promisse of an array of database users internal logins
  */
  getAllSistemaDbUsers(sistema) {
    let lwSistema = sistema.toLowerCase();
    let statement = this.config.statements['allSistemaDBUsers'].replace(/_SISTEMA_/g,lwSistema),
      args = this.getArguments(statement);
    return this._fetchResults(args);
  }

  /**
   *
   * Retrive a list of tables with READ access from this sistema
   * params:
   * sistema - sistema name
   * return a Promisse of an array of database users internal logins and respective accessed tables
   */
  getTablesReadBySistema(sistema) {
    let lwSistema = sistema.toLowerCase();
    let tableStatement = this.config.statements['allTablesReadBySistema'];
    return new Promise( (resolve,reject) => {
      this.getAllSistemaDbUsers(lwSistema)
        .then( (userData) => {
          let userCodes = '';
          userData.map( (u) => {
            userCodes += (u.id + ',');
          } );
          userCodes = userCodes.slice(0,-1);
          tableStatement = tableStatement.replace(/_CODIGOS_/g,userCodes);
          console.log(tableStatement);
          let args = this.getArguments(tableStatement);
          this._fetchResults(args, (r, parsedResults) => {
            if (r.rest && r.rest.length == 5) {
              let rData = {
                fromId:r.rest[0],
                fromIdentificador:r.rest[1],
                verb:r.rest[2],
                toId:r.rest[3],
                toIdentificador:r.rest[4]
              }
              parsedResults.push(rData);
            }
            return parsedResults;
          })
            .then( (data) => {
              let reducedData = {};
              let mainCount = 0;
              data.map( (d) => {
                if (!reducedData[d.toIdentificador]) {
                  reducedData[d.toIdentificador] = {
                    data:[],
                    count:0
                  };
                }
                reducedData[d.toIdentificador].data.push(d);
                reducedData[d.toIdentificador].count += 1;
                mainCount += 1;
              } )
              resolve({results:reducedData, totalTabelas:mainCount});
            } )
            .catch( (reason) => reject(reason) );
        } )
        .catch( (reason) => reject(reason) );
    });
  }

  /**
   *
   * Prepare arguments for query
   * params statement
   * return a prepared arg object
   */
   getArguments(statement) {
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
export default sistemas;

// const sistemas = [
//   {nome:'Sistema 1', id:'S1'},
//   {nome:'Sistema 2', id:'S2'},
//   {nome:'Sistema 3', id:'S3'}
// ];
// export default sistemas;
