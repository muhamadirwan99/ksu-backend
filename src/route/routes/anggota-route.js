import { userRouter } from "../api.js";
import anggotaController from "../../controller/anggota-controller.js";

const anggotaRoute = () => {
  // Anggota API
  userRouter.post(
    "/api/anggota/create-anggota",
    anggotaController.createAnggota,
  );
  userRouter.post("/api/anggota/detail-anggota", anggotaController.getAnggota);
  userRouter.post(
    "/api/anggota/update-anggota",
    anggotaController.updateAnggota,
  );
  userRouter.post(
    "/api/anggota/remove-anggota",
    anggotaController.removeAnggota,
  );
  userRouter.post("/api/anggota/list-anggota", anggotaController.listAnggota);
};

export default anggotaRoute;
