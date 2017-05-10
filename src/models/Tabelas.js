// our example model is just an Array
import ModelBase from './ModelBase';
class Tabelas extends ModelBase{
  constructor() {
    super();
    this.statements = {
      "oneTabela":"MATCH (v:`Tabela`) WHERE (lower(v.`Identificador`) = '_TABELA_' OR lower(v.`Código`) = '_TABELA_' OR lower(v.`Nome`) = '_TABELA_') RETURN v",
      "tabelasWiki":"/api.php?action=ask&format=json&query=%5B%5BPossui+direito+de+leitura+em%3A%3A%2B%5D%5D%7C%3FPossui+direito+de+leitura+em%7Cmainlabel%3D-+",
      "create_page":"/api.php?action=edit&format=json&title=__PAGETITLE__&section=0&text=__BODY__&token=__TOKEN__",
      "get_token":"/api.php?action=query&meta=tokens"
    }
  }
  /**
  *
  * Get a sistema from mapa da informação Neo4J
  * params:
  * sistema
  * return a Promise of an array of objects representing sistema
  *
  */
  getTabela(tabela) {
    let lwTabela = tabela.replace(/ /g,'_').toLowerCase();
    console.log(lwTabela);
    let statement = this.statements['oneTabela'].replace(/_TABELA_/g,lwTabela),
      args = this._getArguments(statement);
    return this._fetchResults(args);
  }

  /**
   *
   * Get a list of Tabela de Banco de Dados pages from wiki
   * return a Promise of an array of objects representing sistema
   *
   */
   getTabelasDeBancoDeDadosLinks() {
     let statement = this.statements['tabelasWiki'];

     return this._fetchWebApiResults(statement,['query','results'],{},'get', (data) => {
       let results = {'tabelas':[]};
       for (let key in data.query.results) {
         let tabelas = data.query.results[key].printouts['Possui direito de leitura em'];
         tabelas.forEach( (item) => {
           let nomeTabela = item['fulltext'];
           if (!results.tabelas.includes(nomeTabela)) results.tabelas.push(nomeTabela);
         } );
       }
       return results;
     });
   }

   /**
    *
    * create pages of Tabela de Banco de Dados, based on an array of names
    * params:
    *  list of names
    * return a Promise of completed execution
    *
    */
    createPageTabelaDeBancoDeDados(nomes) {
      let promises = [];
      let statement = this.statements['get_token'];
      let pageBody = '%7B%7BTemplateTabelaBancoDados%7D%7D%0A%7B%7BTabela+de+Banco+de+Dados%7D%7D%0A'
      return new Promise( (resolve,reject) => {
        this._fetchWebApiResults(statement,['query','tokens','csrftoken'],{},'get',(data) => {
          return encodeURI(data.query.tokens.csrftoken);
        }).then(token => {
          let i = 1;
          let total = nomes.length;
          nomes.forEach((item) => {
            statement = this.statement['create_page'].replace(/__PAGETITLE__/g,item).replace(/__BODY__/g,pageBody).replace(/__TOKEN__/g,token);
            let promise = this._fetchWebApiResults(statement,['edit','result'],{},'get',(data) => {
              console.log('Processed ' + i + ' of ' + total);
              i++;
              return data.edit.result;
            });
            promises.push(promise);
          });
          Promise.all(promises).then((data)=>{
            if (data.includes('Failure')) reject('Error in creation');
            else resolve('All created');
          }).catch((reason) => reject('Error in creation'));
        }).catch(reason => {
          reject(reason);
        });
      });
    }
}
export default Tabelas;
