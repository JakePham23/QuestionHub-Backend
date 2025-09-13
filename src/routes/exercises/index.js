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
        const query = `SELECT * FROM get_questions_with_choices_by_topic_id($1)`;
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


router.get('/:topicId/answer-correct', async (req, res) => {
        const { topicId } = req.params;
    try {
        const query = `SELECT * FROM get_answer_correct_by_topic_id($1)`;
        const { rows } = await db.query(query, [topicId]);
        // console.log("answer-correct");

        if (rows.length === 0) {
            return ResponseFactory.create(ResponseTypes.NOT_FOUND, {
                message: 'Không tìm thấy câu trả lời cho câu hỏi này'
            }).send(res);
        }
        return ResponseFactory.create(ResponseTypes.SUCCESS, {
            metadata: rows,
            message: 'Lấy thông tin chủ đề thành công.'
        }).send(res);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu bài tập:', error);
        return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
            message: 'Lỗi server nội bộ'
        }).send(res);
    }
}); 


router.get('/:topicId/answer-detail', async (req, res) => {
        const { topicId } = req.params;
    try {
        const query = `SELECT * FROM get_answer_details_by_topic_id($1)`;
        const { rows } = await db.query(query, [topicId]);

        if (rows.length === 0) {
            return ResponseFactory.create(ResponseTypes.NOT_FOUND, {
                message: 'Không tìm thấy câu trả lời cho chủ đề này'
            }).send(res);
        }
        
        return ResponseFactory.create(ResponseTypes.SUCCESS, {
            metadata: rows,
            message: 'Lấy thông tin chủ đề thành công.'
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

router.get('/exercise-topic-status', async (req, res) => {
  try {
    // ⚡ Lấy user_id từ query
    const user_id = Number(req.query.user_id);
    if (!user_id) {
      return ResponseFactory.create(ResponseTypes.BAD_REQUEST, {
        message: 'Thiếu user_id'
      }).send(res);
    }

    const query = `SELECT * FROM get_topic_status_by_user($1)`;
    const { rows } = await db.query(query, [user_id]);

    return ResponseFactory.create(ResponseTypes.SUCCESS, {
      message: 'Lấy thông tin trạng thái bài tập thành công.',
      metadata: rows
    }).send(res);

  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu trạng thái bài tập', error);
    return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
      message: 'Lỗi server nội bộ.'
    }).send(res);
  }
});
router.post('/attempt', async (req, res) => {
  try {
    const { user_id, question_id, selected_answer_id, user_answer_text, is_correct } = req.body;

    const query = `SELECT save_question_attempt($1,$2,$3,$4,$5)`;
    await db.query(query, [
      user_id,
      question_id,
      selected_answer_id,
      user_answer_text,
      is_correct
    ]);

    return ResponseFactory.create(ResponseTypes.SUCCESS, {
      message: 'Lưu attempt thành công'
    }).send(res);

  } catch (err) {
    console.error('Lỗi khi lưu attempt', err);
    return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
      message: 'Lỗi server nội bộ'
    }).send(res);
  }
});
router.get('/:topicId/question-attempts', async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.query.user_id; // 📌 nhận từ query

    if (!userId) {
      return ResponseFactory.create(ResponseTypes.BAD_REQUEST, {
        message: 'Thiếu user_id'
      }).send(res);
    }
    const query = `
      SELECT qa.question_id, qa.selected_answer_id, qa.user_answer_text, qa.is_correct
      FROM question_attempts qa
      JOIN questions q ON qa.question_id = q.question_id
      WHERE qa.user_id = $1 AND q.topic_id = $2
    `;

    const { rows } = await db.query(query, [userId, topicId]);

    return ResponseFactory.create(ResponseTypes.SUCCESS, {
      metadata: rows
    }).send(res);

  } catch (err) {
    console.error('Lỗi khi lấy question attempts:', err);
    return ResponseFactory.create(ResponseTypes.INTERNAL_ERROR, {
      message: 'Lỗi server nội bộ'
    }).send(res);
  }
});


export default router;