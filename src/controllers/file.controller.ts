import { HttpException } from '@/exceptions/HttpException';
import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { logger } from '@utils/logger';
import { AuthToken } from '@/interfaces/authToken.interface';
import HummusRecipe from 'hummus-recipe';
import fs from 'fs';

class FileController {
  public upload = (req: Request, res: Response): void => {
    //check if user can upload file
    if (!this.userCanUploadFile(req.jwtTokenPayload)) {
      throw new HttpException(401, 'You dont have permission to upload this file');
    }
    const file = req.files.file as UploadedFile;
    //upload file
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
    const tmpFileName = Buffer.from(fileId + email).toString('base64');
    const src = `upload/${fileId}.pdf`;
    const out = `tmp/${tmpFileName}.pdf`;
    //add watermark and download file
    try {
      const recipe = new HummusRecipe(src, out);

      const pageCount = recipe.metadata.pages;

      logger.info(`adding watermark for ${pageCount} pages of file ${fileId}`);
      for (let i = 1; i <= pageCount; i++) {
        recipe
          .editPage(i)
          .text(email, 150, 300, {
            color: '#000000',
            rotation: 45,
            size: 30,
            opacity: 0.5,
          })
          .endPage();
      }

      recipe.endPDF(async () => {
        logger.info(`finished adding watermak to file ${fileId}`);
        logger.info(`downloading file ${fileId}`);

        const data = await fs.readFileSync(out);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="file.pdf"`,
        });
        fs.unlinkSync(out);
        res.end(data);
      });
    } catch (error) {
      throw new HttpException(500, 'Cannot download file, problem with processing');
    }
  };
  private userCanUploadFile = (jwtTokenPayload: AuthToken): boolean => {
    return jwtTokenPayload.roles && jwtTokenPayload.roles.includes('admin');
  };
}
export default FileController;
