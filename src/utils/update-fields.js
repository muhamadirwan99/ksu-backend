const updateFields = (source, target, fields) => {
  fields.forEach((field) => {
    // Ambil nilai dari field, meskipun itu `false`
    const value = field
      .split(".")
      .reduce(
        (o, i) => (o !== undefined && o !== null ? o[i] : undefined),
        source,
      );

    // Jangan abaikan nilai `false`, hanya abaikan `undefined` atau `null`
    if (value !== undefined && value !== null) {
      field.split(".").reduce((o, i, index, arr) => {
        if (index === arr.length - 1) {
          // Tetapkan nilai field, termasuk `false`
          o[i] = value;
        }
        return o[i]; // Hindari menggunakan objek default kosong
      }, target);
    }
  });
};

export { updateFields };
