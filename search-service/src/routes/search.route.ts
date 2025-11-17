import { Router } from "express";
import { searchPostController } from "../controllers/search.controller";
import authenticate from "../middlewares/auth-middleware";

const router = Router();

router.get("/posts", authenticate, searchPostController);

export default router;
