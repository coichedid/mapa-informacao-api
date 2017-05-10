import resource from 'resource-router-middleware';
import Tabelas from '../models/Tabelas';
let tabelas = new Tabelas();

let generalFunctions = {
};
let extraFunctions = {
  tabelas_de_banco_de_dados({params},res) {
    tabelas.getTabelasDeBancoDeDadosLinks()
      .then( (data) => res.json(data) )
      .catch( (reason) => res.status(400).send(reason) );
  }
}

export default ({ config, db }) => {
  tabelas.setConfig(config);
  let router = resource(generalFunctions);
  for (let key in extraFunctions) {
    router.get('/'+key,extraFunctions[key]);
  }
  return router;
}
