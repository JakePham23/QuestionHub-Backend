import { Router } from 'express';
import db from '../../db.js';

const router = Router();

// Endpoint để lấy danh sách đề thi (có thể lọc theo lớp và môn)
router.get('/exams', async (req, res) => {
    // Lấy gradeId và subjectId từ query string
    const { gradeId, subjectId } = req.query;
    
    try {
        let rows;

        // Nếu có cả gradeId và subjectId, sử dụng hàm SQL function
        if (gradeId && subjectId) {
            const query = `SELECT * FROM get_exams_by_grade_and_subject($1, $2)`;
            const { rows: fetchedRows } = await db.query(query, [gradeId, subjectId]);
            rows = fetchedRows;
        } else {
            // Nếu không có, lấy tất cả các đề thi
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
            return res.status(404).json({ message: 'Không tìm thấy đề thi nào phù hợp.' });
        }
        
        res.json(rows);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đề thi:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ.' });
    }
});

// Endpoint để lấy thông tin chi tiết một đề thi
router.get('/exams/:examId', async (req, res) => {
    const { examId } = req.params;
    
    try {
        const query = `SELECT * FROM get_exam_by_id($1)`;
        
        const { rows } = await db.query(query, [examId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi.' });
        }
        
        res.json(rows[0]); 

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đề thi:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ.' });
    }
});
// Thêm endpoint mới để lấy chi tiết câu hỏi và đáp án của một đề thi
router.get('/exams/:examId/questions', async (req, res) => {
    const { examId } = req.params;

    try {
        const query = `SELECT * FROM get_exam_questions_with_choices($1)`;
        const { rows } = await db.query(query, [examId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi nào cho đề thi này.' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu câu hỏi và đáp án:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ.' });
    }
});
// Endpoint để lấy dữ liệu chương trình học
router.get('/data_info', async (req, res) => {
    try {
        const query = `
            SELECT * FROM grade_subject_chapter;
        `;
        
        const { rows } = await db.query(query);
    
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu chương trình học.' });
        }
        
        res.json(rows);
    
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu chương trình học:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
}); 
router.get('/chude1/luonggiac', async (req, res) => {
    try {
        const query = `
            SELECT * FROM answer_choices;
        `;
        
        const { rows } = await db.query(query);
    
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu chương trình học.' });
        }
        
        res.json(rows);
    
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu chương trình học:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
}); 
// Đừng quên export router
export default router;