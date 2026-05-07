const modalData = {
        'card1': {
            title: 'Công cụ Kinh tế: Mô hình "Quyền sở hữu"',
            content: `
                <p><strong>Chương trình Bean Stock (Cổ phiếu thưởng):</strong></p>
                <ul>
                    <li>Starbucks tặng cổ phiếu cho cả nhân viên bán thời gian (từ 12h/tuần).</li>
                    <li>Biến nhân viên thành "người làm chủ", thúc đẩy bảo vệ tài sản thương hiệu.</li>
                </ul>
                <p><strong>Phúc lợi "May đo" (Tailored Benefits):</strong></p>
                <ul>
                    <li><strong>Giáo dục:</strong> Chi trả 100% học phí đại học ASU.</li>
                    <li><strong>Sức khỏe:</strong> Bảo hiểm toàn diện (tinh thần & nha khoa).</li>
                </ul>
            `
        },
        'card2': {
            title: 'Công cụ Tâm lý - Xã hội: Văn hóa "Đối tác"',
            content: `
                <p><strong>Xóa bỏ cấp bậc:</strong> Mọi nhân viên là "Đối tác" (Partner). Quản lý cùng pha chế và dọn dẹp tại quầy.</p>
                <p><strong>Sứ mệnh kết nối:</strong></p>
                <ul>
                    <li>Dự án hỗ trợ nông dân bền vững (C.A.F.E Practices).</li>
                    <li>Nhân viên tự hào vì đóng góp vào sự phát triển toàn cầu.</li>
                    <li>Engagement Score đạt 88% - mức kỷ lục ngành F&B.</li>
                </ul>
            `
        },
        'card3': {
            title: 'Công cụ Nội dung công việc: Quyền tự chủ',
            content: `
                <p><strong>Trao quyền sáng tạo (Thuyết Herzberg):</strong></p>
                <p>Barista tự do tương tác, viết lời chúc lên cốc mà không cần kịch bản. Tự ý pha lại nước nếu khách không hài lòng.</p>
                <p><strong>Lộ trình thăng tiến (Growth Path):</strong></p>
                <ul>
                    <li>Hơn 70% Quản lý xuất thân từ vị trí Barista.</li>
                    <li>Nhân viên gắn bó vì thấy được tương lai phát triển rõ ràng.</li>
                </ul>
            `
        }
    };

    // Mở Popup sang trọng
    function openModal(cardId, element) {
        const modal = document.getElementById('read-more-modal');
        const data = modalData[cardId];
        
        // --- LOGIC LẤY ẢNH TỪ CARD ---
        // Tìm thẻ cha '.info-card' gần nhất, sau đó tìm ảnh bên trong '.card-image'
        const cardImageSrc = element.closest('.info-card').querySelector('.card-image img').src;
        
        // Đổ dữ liệu vào Modal
        document.getElementById('modal-img').src = cardImageSrc; // Lấy ảnh từ card vừa bấm
        document.getElementById('modal-title').innerText = data.title;
        document.getElementById('modal-desc').innerHTML = data.content;
        
        // Hiển thị Popup với hiệu ứng sang trọng
        document.body.style.overflow = 'hidden';
        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    // Đóng Popup sang trọng
    function closeModal() {
        const modal = document.getElementById('read-more-modal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 500); 
    }

    // Đóng khi click ngoài khung trắng
    window.onclick = function(event) {
        const modal = document.getElementById('read-more-modal');
        if (event.target == modal) closeModal();
    }

    // Hỗ trợ đóng bằng phím ESC trên bàn phím (Chuẩn Accessibility)
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            closeModal();
        }
    });