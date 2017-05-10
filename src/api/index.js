import { version } from '../../package.json';
import { Router } from 'express';
import sistemas from './sistemas';
import tabelas from './tabelas';
import bulkcreate from './bulkcreate';

export default ({ config, db }) => {
	let api = Router();

	api.use('/sistemas',sistemas({ config, db }));
	api.use('/tabelas',tabelas({ config, db }));
	api.use('/bulkcreate',bulkcreate({config,db}));

	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}
