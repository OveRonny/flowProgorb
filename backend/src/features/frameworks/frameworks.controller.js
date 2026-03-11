import {
    handleAsync
} from '../helpers/handleAsync.js';

import {
    getAllFrameworksService
} from './frameworks.service.js';

export const getAllFrameworksController = handleAsync(async (req, res) => {
    const frameworks = await getAllFrameworksService();
    res.json(frameworks);
});