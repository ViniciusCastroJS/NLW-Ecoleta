import multer from 'multer';
import path from 'path';
import crypto from 'crypto'

export default {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..' , '..', 'uploads'),
    filename(res, file, callback){
      const hash = crypto.randomBytes(7).toString('hex');

      const filename = `${hash}-${file.originalname}`;

      callback(null, filename)
    }
  })
};