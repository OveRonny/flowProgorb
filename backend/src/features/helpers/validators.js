export function parseId(id) {
    const num = Number(id);
    if (isNaN(num)) {
        throw new Error('Invalid id, must be a number');
    }
    return num;
}