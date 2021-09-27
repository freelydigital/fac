import { HttpException } from '@/exceptions/HttpException';
import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { logger } from '@utils/logger';
import HummusRecipe from 'hummus-recipe';
import fs from 'fs';

class FileController {
  public upload = (req: Request, res: Response): void => {
    if (!(req.jwtTokenPayload.roles && req.jwtTokenPayload.roles.includes('admin'))) {
      throw new HttpException(401, 'You dont have permission to upload this file');
    }
    const file = req.files.file as UploadedFile;
    file
      .mv(`upload/${req.jwtTokenPayload.file}.pdf`)
      .then(() => {
        res.status(201).json({ message: 'File uploaded' });
      })
      .catch(error => {
        res.status(500).json({ message: 'File cannot be uploaded' + error });
      });
  };
  public download = (req: Request, res: Response): void => {
    const email = req.jwtTokenPayload.sub;
    const fileId = req.jwtTokenPayload.file;
    const src = `upload/${fileId}.pdf`;
    const filename = req.body.filename || 'file.pdf'; 
    let readBuffer: Buffer;

    try {
      readBuffer = fs.readFileSync(src);
    } catch (error) {
      throw new HttpException(404, 'File not found');
    }

    try {
      const recipe = new HummusRecipe(readBuffer);
      const pageCount = recipe.metadata.pages;

      logger.info(`adding watermark for ${pageCount} pages of file ${fileId}`);
      for (let i = 1; i <= pageCount; i++) {
        logger.info(`Adding water mark to page ${i} of file ${fileId}`);
        recipe
          .editPage(i)
          .text(email, 150, 300, {
            color: '#000000',
            rotation: 45,
            size: 30,
            opacity: 0.3,
          })
          .endPage();
      }

      recipe.endPDF(outBuffer => {
        logger.info(`finished adding watermak to file ${fileId}`);
        logger.info(`downloading file ${fileId}`);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${filename}"`,
        });
        res.end(outBuffer);
      });
    } catch (error) {
      throw new HttpException(500, 'Cannot download file, problem with processing');
    }
  };
}
export default FileController;
