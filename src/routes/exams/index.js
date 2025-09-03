import { Router } from 'express';
import db from '../../db.js';
import ResponseFactory from '../../responses/responseFactory.js';
import { ResponseTypes } from '../../responses/response.types.js';

const router = Router();

// Endpoint để lấy danh sách đề thi (có thể lọc theo lớp và môn)
router.get('/exams', async (req, res) => {
    const { gradeId, subjectId } = req.query;
    try {
        let rows;
        if (gradeId && subjectId) {
            const query = `SELECT * FROM get_exams_by_grade_and_subject($1, $2)`;
            const { rows: fetchedRows } = await db.query(query, [gradeId, subjectId]);
            rows = fetchedRows;
        } else {
            const query = `
                SELECT 
                    e.exam_id,
                    e.title,
                    e.duration_minutes,
                    e.passing_score,
                    s.subject_name,
                    g.grade_name
                FROM exams e
                JOIN subjects s ON e.subject_id = s.subject_id
                JOIN grades g ON e.grade_id = g.grade_id
                ORDER BY e.created_at DESC;
            `;
            const { rows: fetchedRows } = await db.query(query);
            rows = fetchedRows;
        }

        if (rows.length === 0) {
            return ResponseFactory.create(ResponseTypes.NOT_FOUND, {
                message: 'Không tìm thấy đề thi nào phù hợp.'
            }).send(res);
        }
        
        return ResponseFactory.create(ResponseTypes.SUCCESS, {
            metadata: rows,
            message: 'Lấy danh sách đề thi thành công.'
        }).send(res);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đề thi:', error);
        return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
            message: 'Lỗi server nội bộ'
        }).send(res);
    }
});

// Endpoint để lấy thông tin chi tiết một đề thi
router.get('/exams/:examId', async (req, res) => {
    const { examId } = req.params;
    
    try {
        const query = `SELECT * FROM get_exam_by_id($1)`;
        const { rows } = await db.query(query, [examId]);

        if (rows.length === 0) {
            return ResponseFactory.create(ResponseTypes.NOT_FOUND, {
                message: 'Không tìm thấy đề thi.'
            }).send(res);
        }
        
        return ResponseFactory.create(ResponseTypes.SUCCESS, {
            metadata: rows[0],
            message: 'Lấy thông tin đề thi thành công.'
        }).send(res);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đề thi:', error);
        return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
            message: 'Lỗi server nội bộ'
        }).send(res);
    }
});

// Endpoint để lấy chi tiết câu hỏi và đáp án của một đề thi
router.get('/exams/:examId/questions', async (req, res) => {
    const { examId } = req.params;

    try {
        const query = `SELECT * FROM get_exam_questions_with_choices($1)`;
        const { rows } = await db.query(query, [examId]);

        if (rows.length === 0) {
            return ResponseFactory.create(ResponseTypes.NOT_FOUND, { 
                message: 'Không tìm thấy câu hỏi nào cho đề thi này.' 
            }).send(res);
        }

        return ResponseFactory.create(ResponseTypes.SUCCESS, {
            metadata: rows,
            message: 'Lấy danh sách câu hỏi và đáp án thành công.'
        }).send(res);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu câu hỏi và đáp án:', error);
        return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
            message: 'Lỗi server nội bộ'
        }).send(res);
    }
});

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

// test exercise
router.get('/chude1/luonggiac', async (req, res) => {
    try {
        const query = `SELECT * FROM answer_choices;`;
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