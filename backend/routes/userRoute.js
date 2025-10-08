import express from "express"
import { getUsers } from "../controllers/userControllers.js";

const router = express.Router();

router.get('/search', getUsers);

export default router;