import { v4 as uuidv4 } from "uuid";

const generateShortIdFromUUID = () => {
  return uuidv4().slice(0, 8); // Mengambil 6 karakter pertama dari UUID
};
export { generateShortIdFromUUID };
