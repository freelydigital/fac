import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import FileController from '@controllers/file.controller';
import AuthMiddleware from '@/middlewares/auth.middleware';

class FileRoute implements Routes {
  public path = '/file';
  public router = Router();
  public fileController = new FileController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, AuthMiddleware, this.fileController.upload);
    this.router.get(`${this.path}`, AuthMiddleware, this.fileController.download);
  }
}

export default FileRoute;
