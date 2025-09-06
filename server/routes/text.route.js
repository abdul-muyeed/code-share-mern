import { Router } from "express";
import { textController } from "../controllers/text.controller.js";


export const TextRoute = Router();



TextRoute.get("/", textController.testingRoute);
