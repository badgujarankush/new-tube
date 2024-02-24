import { Router } from "express";
import userRoute from "./user.routes.js";

const router = Router();

const routes = [{ path: "/api/v1/users", mw: [userRoute] }];

routes.forEach((route) => {
  router.use(route.path, route.mw);
});

export default router;
