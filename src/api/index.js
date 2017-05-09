import { version } from '../../package.json';
import { Router } from 'express';
// import facets from './facets';
import sistemas from './sistemas';
import tabelas from './tabelas';

export default ({ config, db }) => {
	let api = Router();

	// // mount the facets resource
	// api.use('/facets', facets({ config, db }));
	//
	// perhaps expose some API metadata at the root
	api.use('/sistemas',sistemas({ config, db }));
	api.use('/tabelas',tabelas({ config, db }));

	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
