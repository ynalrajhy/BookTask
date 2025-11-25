import { Router } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/bookController';
import upload from '../middlewares/multer';

const router = Router();

router.get('/', getAllBooks);

router.get('/:id', getBookById);

router.post('/', upload.single('file'), createBook);

router.put('/:id', upload.single('file'), updateBook);

router.delete('/:id', deleteBook);

export default router;

