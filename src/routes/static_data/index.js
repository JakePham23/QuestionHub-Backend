import { Router } from 'express';
import db from '../../db.js';
import ResponseFactory from '../../responses/responseFactory.js';
import { ResponseTypes } from '../../responses/response.types.js';

const router = Router();


// Endpoint để lấy dữ liệu chương trình học
router.get('/data_info', async (req, res) => {
    try {
        const query = `SELECT * FROM grade_subject_chapter;`;
        const { rows } = await db.query(query);
    
        if (rows.length === 0) {
            return ResponseFactory.create(ResponseTypes.NOT_FOUND, {
                message: 'Không tìm thấy dữ liệu chương trình học.'
            }).send(res);
        }
        
        return ResponseFactory.create(ResponseTypes.SUCCESS, {
            metadata: rows,
            message: 'Lấy dữ liệu chương trình học thành công.'
        }).send(res);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu chương trình học:', error);
        return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
            message: 'Lỗi server nội bộ'
        }).send(res);
    }
}); 


export default router;