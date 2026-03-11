import {
    handleAsync
} from '../helpers/handleAsync.js';

import {
    getAllLanguagesService
} from './languages.service.js';

export const getAllLanguagesController = handleAsync(async (req, res) => {
    const languages = await getAllLanguagesService();
    res.json(languages);
});