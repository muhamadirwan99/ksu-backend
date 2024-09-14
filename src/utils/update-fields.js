const updateFields = (source, target, fields) => {
    fields.forEach(field => {
        const value = field.split('.').reduce((o, i) => (o ? o[i] : undefined), source); // Retrieve nested field value
        if (value !== undefined) {
            field.split('.').reduce((o, i, index, arr) => {
                if (index === arr.length - 1) {
                    o[i] = value;
                }
                return o[i] || (o[i] = {});
            }, target);
        }
    });
};


export { updateFields };