// src/routes/imageProxy.js
import { Router } from "express";
import path from "path";
import { fileURLToPath } from 'url';
import ResponseFactory from '../../responses/responseFactory.js';
import { ResponseTypes } from '../../responses/response.types.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn vật lý tới thư mục public/images
const imageBasePath = path.join(__dirname, '../..', 'public');

// Endpoint proxy để xử lý yêu cầu ảnh
router.get('/proxy-image', (req, res) => {
    // Lấy đường dẫn ảnh từ tham số query 'path'
    const imageRelativePath = req.query.path;

    if (!imageRelativePath) {
        console.error('Image path is required.');
        return ResponseFactory.create(ResponseTypes.BAD_REQUEST, {
            message: 'Image path is required.'
        }).send(res);
    }

    // Xây dựng đường dẫn vật lý đầy đủ
    // Đảm bảo rằng đường dẫn không vượt ra khỏi thư mục public/images
    const safePath = path.normalize(imageRelativePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(imageBasePath, safePath);

    // Gửi file ảnh
    res.sendFile(fullPath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            // Gửi lỗi 404 nếu file không tồn tại
            return ResponseFactory.create(ResponseTypes.NOT_FOUND, {
                message: 'Image not found.'
            }).send(res);
        }
    });
});

export default router;