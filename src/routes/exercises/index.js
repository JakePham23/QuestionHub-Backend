import { Router } from 'express';
import db from '../../db.js';
import ResponseFactory from '../../responses/responseFactory.js';
import { ResponseTypes } from '../../responses/response.types.js';

const router = Router();

// test exercise
// router.get('/:topicId', async (req, res) => {
//         const { topicId } = req.params;
//     try {
//         const query = `SELECT * FROM get_questions_by_topic_id($1)`;
//         const { rows } = await db.query(query, [topicId]);

//         if (rows.length === 0) {
//             return ResponseFactory.create(ResponseTypes.NOT_FOUND, {
//                 message: 'Không tìm thấy chuyên đề này'
//             }).send(res);
//         }
        
//         return ResponseFactory.create(ResponseTypes.SUCCESS, {
//             metadata: rows[0],
//             message: 'Lấy thông tin chuyên đề thành công.'
//         }).send(res);

//     } catch (error) {
//         console.error('Lỗi khi lấy dữ liệu bài tập:', error);
//         return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
//             message: 'Lỗi server nội bộ'
//         }).send(res);
//     }
// }); 

router.get('/:topicId/questions', async (req, res) => {
        const { topicId } = req.params;
    try {
        const query = `SELECT * FROM get_questions_by_topic_id($1)`;
        const { rows } = await db.query(query, [topicId]);

        if (rows.length === 0) {
            return ResponseFactory.create(ResponseTypes.NOT_FOUND, {
                message: 'Không tìm thấy chuyên đề này'
            }).send(res);
        }
        
        return ResponseFactory.create(ResponseTypes.SUCCESS, {
            metadata: rows,
            message: 'Lấy thông tin chuyên đề thành công.'
        }).send(res);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu bài tập:', error);
        return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
            message: 'Lỗi server nội bộ'
        }).send(res);
    }
}); 
// Ví dụ trong một route Express
router.get('/exercise-topics', async (req, res) => {
    try {
        const query = `SELECT * FROM get_topic_exercise_info()`;
        const { rows } = await db.query(query);

        // Xử lý dữ liệu để nhóm theo cấu trúc bạn muốn ở frontend
        const groupedData = {}; // Ví dụ: nhóm theo môn học và khối lớp

        return ResponseFactory.create(ResponseTypes.SUCCESS, {
            message: 'Lấy thông tin chuyên đề thành công.',
            metadata: rows
        }).send(res);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu chuyên đề:', error);
        return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
            message: 'Lỗi server nội bộ.'
        }).send(res);
    }
});
export default router;