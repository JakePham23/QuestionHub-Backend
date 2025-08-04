// src/routes/exams.js
import { Router } from 'express';
import db from '../db.js';
import PostgreSQLDatabase from '../db.js';

const query = PostgreSQLDatabase.query.bind(PostgreSQLDatabase);

const router = Router();

// Endpoint để lấy chi tiết một mã đề
router.get('/versions/:versionId', async (req, res) => {
  const { versionId } = req.params;

  try {
    const { rows: versions } = await db.query(
      'SELECT questions FROM v_exam_version_details WHERE version_id = $1',
      [versionId]
    );

    if (versions.length === 0 || !versions[0].questions) {
      return res.status(404).json({ error: 'Không tìm thấy mã đề này.' });
    }

    res.json(versions[0].questions);

  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu đề thi:', error);
    res.status(500).json({ error: 'Lỗi server nội bộ' });
  }
});

router.get('/exams', async (req, res) => {
    // Lấy gradeId và subjectId từ query string
    const { gradeId, subjectId } = req.query;
    
    try {
        let query = `
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
            WHERE e.is_active = TRUE
        `;
        
        const queryParams = [];

        // Thêm điều kiện lọc nếu gradeId tồn tại
        if (gradeId) {
            queryParams.push(gradeId);
            query += ` AND e.grade_id = $${queryParams.length}`;
        }
        
        // Thêm điều kiện lọc nếu subjectId tồn tại
        if (subjectId) {
            queryParams.push(subjectId);
            query += ` AND e.subject_id = $${queryParams.length}`;
        }
        
        query += ` ORDER BY e.created_at DESC;`;

        const { rows } = await db.query(query, queryParams);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đề thi nào phù hợp.' });
        }
        
        res.json(rows);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đề thi:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ.' });
    }
});
export default router;