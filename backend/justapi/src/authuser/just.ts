import { diskStorage } from 'multer';
import { extname } from 'path';

export const CustomStorage =  {
  storage: diskStorage({
    destination: './image',
    filename: (req, file, callback) => {
      const idd : any = req.user;
      callback(null, file.fieldname + idd.id + '.gif');
    },
  }),
};
