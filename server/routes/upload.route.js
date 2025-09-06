import { Router } from "express";
import { UploadController } from "../controllers/upload.controller.js";



export const UploadRoute = Router();

UploadRoute.post("/", UploadController.uploadFile);