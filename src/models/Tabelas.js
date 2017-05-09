// our example model is just an Array
import ModelBase from './ModelBase';
class Tabelas extends ModelBase{
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
    let statement = this.config.statements['oneTabela'].replace(/_TABELA_/g,lwTabela),
      args = this._getArguments(statement);
    return this._fetchResults(args);
  }
}
export default Tabelas;
