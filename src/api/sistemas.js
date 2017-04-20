import resource from 'resource-router-middleware';
import Sistemas from '../models/sistemas';
let sistemas = new Sistemas();

function transformTablesJson2CSV(data) {
  let results = [];
  results.push(['Usuário', 'Verbo', 'Tabelas']);
  for (let key in data.results) {
    let resultItem = {};
    data.results[key].data.forEach( (item) => {
      if (!resultItem[item.verb]) resultItem[item.verb] = [];
      resultItem[item.verb].push(item.fromIdentificador);
    } );
    for (let verbKey in resultItem) {
      let result = [];
      result.push(key);
      result.push(verbKey);
      let fromIdentificadors = '"' + resultItem[verbKey].join(',') + '"';
      result.push(fromIdentificadors);
      results.push(result);
    }
  }
  return results.join('\n');
}
let generalFunctions = {
  id:'sistema',

  /** For requests with an `id`, you can auto-load the entity.
   *  Errors terminate the request, success sets `req[id] = data`.
   */
  load(req, id, callback) {
    sistemas.getSistema(id)
      .then( (data) => callback(null, data[0]) )
      .catch( (reason) => callback(reason) );
  },

  /** GET / - List all entities */
  index({ params }, res) {
    sistemas.getAll()
      .then( (data) => res.json(data) )
      .catch( (reason) => res.status(400).send(reason) );
  },

  /** GET /:id - Return a given entity */
  read({ sistema }, res) {
    res.json(sistema);
  }
};
let extraFunctions = {
  users({params},res) {
    let sistema = params.sistema;
    if (sistema && sistema.length > 0) {
      sistemas.getAllSistemaDbUsers(sistema)
        .then( (data) => res.json(data) )
        .catch( (reason) => res.status(400).send(reason) );
    }
    else {
      res.status(400).send({message:'Invalid sistema param'});
    }
  },
  tables({params, query},res) {
    let format = query.format;
    let sistema = params.sistema;
    if (sistema && sistema.length > 0) {
      sistemas.getTablesReadBySistema(sistema)
        .then( (data) => {
          let result = data;
          if (format && 'csv' == format.toLowerCase()) {
            result = transformTablesJson2CSV(data);
            res.status(200).send(result);
          }
          else res.json(result);
        } )
        .catch( (reason) => res.status(400).send(reason) );
    }
    else {
      res.status(400).send({message:'Invalid sistema param'});
    }
  }
}

export default ({ config, db }) => {
  sistemas.setConfig(config);
  let router = resource(generalFunctions);
  for (let key in extraFunctions) {
    router.get('/:sistema/'+key,extraFunctions[key]);
  }
  return router;
}
