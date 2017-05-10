// our example model is just an Array
import ModelBase from './ModelBase';
class Sistemas extends ModelBase {
  constructor() {
    super();
    this.statements = {
      "allSistemas":"MATCH (v:`Sistema`) RETURN v ORDER BY v. `Identificador` SKIP { s } LIMIT { l }",
  		"oneSistema":"MATCH (v:`Sistema`) WHERE (lower(v.`Identificador`) CONTAINS '_SISTEMA_' OR lower(v.`Código`) CONTAINS '_SISTEMA_') RETURN v ORDER BY v.`Identificador` SKIP { s } LIMIT { l }",
  		"allSistemaDBUsers":"MATCH (v:`Login`) WHERE (lower(v.`Identificador`) CONTAINS '_SISTEMA_' OR lower(v.`Código`) CONTAINS '_SISTEMA_') RETURN v ORDER BY v.`Identificador` SKIP { s } LIMIT { l }",
  		"allTablesReadBySistema":"MATCH (vFrom)-[r]->(vTo) WHERE (id(vFrom) IN [_CODIGOS_] OR id(vTo) IN [_CODIGOS_]) AND type(r) = 'é uma Tabela com leitura pelo Login' RETURN id(vFrom), vFrom.`Identificador`, type(r), id(vTo), vTo.`Identificador` ORDER BY r.type, vFrom.`Identificador`, vTo.`Identificador` SKIP { s } LIMIT { l }"
    }
  }
  /**
  *
  * Retrive all Sistema objects from Neo4J repository
  * return a Promise to retrived data
  */
  getAll() {
    let statement = this.statements['allSistemas'],
      args = this._getArguments(statement);
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
    let statement = this.statements['oneSistema'].replace(/_SISTEMA_/g,lwSistema),
      args = this._getArguments(statement);
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
    let statement = this.statements['allSistemaDBUsers'].replace(/_SISTEMA_/g,lwSistema),
      args = this._getArguments(statement);
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
    let tableStatement = this.statements['allTablesReadBySistema'];
    return new Promise( (resolve,reject) => {
      this.getAllSistemaDbUsers(lwSistema)
        .then( (userData) => {
          let userCodes = '';
          userData.map( (u) => {
            userCodes += (u.id + ',');
          });

          if (userCodes != '') {
            userCodes = userCodes.slice(0,-1);
            tableStatement = tableStatement.replace(/_CODIGOS_/g,userCodes);
            let args = this._getArguments(tableStatement);
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
          }
          else {
            resolve({results:{}, totalTabelas:0});
          }
        })
        .catch( (reason) => reject(reason) );
    });
  }
}
export default Sistemas;
