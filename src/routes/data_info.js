// src/routes/exams.js
import { Router } from 'express';
// Giả sử db.js đã được cấu hình đúng
import db from '../db.js';

const router = Router();
router.get('/exams/:gradeId/:subjectId', async (req, res) => {
    const { gradeId, subjectId } = req.params;
    
    // Bạn có thể thêm chapterId vào đây nếu muốn lọc chi tiết hơn
    // Tuy nhiên, đề thi thường thuộc về một môn và một lớp
    
    try {
        const query = `
            SELECT 
                e.exam_id,
                e.title,
                e.description,
                e.duration_minutes,
                e.total_questions,
                s.subject_name,
                g.grade_name
            FROM Exams e
            JOIN Subjects s ON e.subject_id = s.subject_id
            JOIN Grades g ON e.grade_id = g.grade_id
            WHERE e.grade_id = $1 AND e.subject_id = $2 AND e.is_active = TRUE
            ORDER BY e.created_at DESC;
        `;
        
        const { rows } = await db.query(query, [gradeId, subjectId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi nào phù hợp.' });
        }
        
        res.json(rows);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đề thi:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ.' });
    }
});
router.get('/data_info', async (req, res) => {
    try {
        const query = `
            -- Lấy toàn bộ các chương trình học có chapter
            SELECT 
                g.grade_id, 
                g.grade_name,
                s.subject_id, 
                s.subject_name,
                c.chapter_id, 
                c.chapter_name, 
                c.chapter_number
            FROM chapters c
            JOIN grades g ON c.grade_id = g.grade_id
            JOIN subjects s ON c.subject_id = s.subject_id

            UNION ALL

            -- Lấy các grade và subject không có chapter (vd: Ôn thi THPT Quốc gia)
            -- Điều kiện WHERE đảm bảo chỉ lấy những grade đặc biệt
            SELECT 
                g.grade_id, 
                g.grade_name,
                s.subject_id, 
                s.subject_name,
                NULL AS chapter_id,  -- Đặt các trường chapter là NULL
                NULL AS chapter_name,
                NULL AS chapter_number
            FROM exams e
            JOIN grades g ON e.grade_id = g.grade_id
            JOIN subjects s ON e.subject_id = s.subject_id
            WHERE g.grade_name = 'Ôn thi THPT Quốc gia'

            ORDER BY grade_id, subject_id, chapter_number;
        `;
        
        const { rows } = await db.query(query);
    
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy dữ liệu chương trình học.' });
        }
        
        // Trả về toàn bộ dữ liệu để frontend xử lý
        res.json(rows);
    
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu chương trình học:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
}); 

// Đừng quên export router
export default router;