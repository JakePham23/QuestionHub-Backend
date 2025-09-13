import Router from 'express';
import ResponseFactory from '../../responses/responseFactory.js';
import { ResponseTypes } from '../../responses/response.types.js';
const router = Router();

router.get('/:questionId/answer-detail', async(req, res)=>{

    const { topicId: questionId } = req.params;
    try {
        const query = `SELECT * FROM get_answer_details_by_question_id($1)`;
        const { rows } = await db.query(query, [questionId]);

        if (rows.length === 0) {
            return ResponseFactory.create(ResponseTypes.NOT_FOUND, {
                message: 'Câu trả lời này chưa được cập nhập'
            }).send(res);
        }
         
        return ResponseFactory.create(ResponseTypes.SUCCESS, {
            metadata: rows,
            message: 'Lấy thông tin câu hỏi thành công.'
        }).send(res);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu câu hỏi:', error);
        return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
            message: 'Lỗi server nội bộ'
        }).send(res);
    }
});

export default router;