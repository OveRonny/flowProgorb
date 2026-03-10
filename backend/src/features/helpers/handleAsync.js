export const handleAsync = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (err) {
       console.error(err);
        res.status(err.status ?? 500).json({ error: 'Internal server error', message: err.message });
    }
};