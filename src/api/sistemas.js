import resource from 'resource-router-middleware';
import Sistemas from '../models/sistemas';
let sistemas = new Sistemas();
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
  tables({params},res) {
    let sistema = params.sistema;
    if (sistema && sistema.length > 0) {
      sistemas.getTablesReadBySistema(sistema)
        .then( (data) => res.json(data) )
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
