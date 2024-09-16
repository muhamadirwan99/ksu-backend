import {nanoid} from "nanoid";

const generateNanoId = () => {
    return nanoid(6); // Menghasilkan string acak sepanjang 6 karakter
};

export default generateNanoId;