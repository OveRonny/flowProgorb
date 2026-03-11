import {
    handleAsync
} from '../helpers/handleAsync.js';

import {
    getAllLibrariesService
} from './libraries.service.js';

export const getAllLibrariesController = handleAsync(async (req, res) => {
    const libraries = await getAllLibrariesService();
    res.json(libraries);
});