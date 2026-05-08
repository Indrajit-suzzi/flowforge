import express from 'express';
import ContentType from '../models/contentType.js';
import {
    create,
    getAll,
    getOne,
    update,
    remove
} from '../controllers/genericController.js';

const router = express.Router();

router.post('/', create(ContentType));
router.get('/', getAll(ContentType));
router.get('/:id', getOne(ContentType));
router.put('/:id', update(ContentType));
router.delete('/:id', remove(ContentType));

export default router;
