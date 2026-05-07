const modalData = {
        'card1': {
            title: 'Công cụ Kinh tế: Mô hình "Quyền sở hữu"',
            img: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c02?q=80&w=800',
            content: `
                <p><strong>Chương trình Bean Stock (Cổ phiếu thưởng):</strong></p>
                <ul>
                    <li><strong>Bằng chứng:</strong> Starbucks là công ty bán lẻ đầu tiên tặng cổ phiếu cho cả nhân viên bán thời gian (làm từ tối thiểu 12h/tuần).</li>
                    <li><strong>Tác động:</strong> Biến nhân viên từ "người làm thuê" thành "người làm chủ", thúc đẩy họ bảo vệ tài sản và thương hiệu.</li>
                </ul>
                <p><strong>Phúc lợi "May đo" (Tailored Benefits):</strong></p>
                <ul>
                    <li><strong>Giáo dục:</strong> Chương trình College Achievement Plan chi trả 100% học phí đại học tại ASU cho nhân viên.</li>
                    <li><strong>Sức khỏe:</strong> Gói bảo hiểm toàn diện bao gồm cả sức khỏe tinh thần và chăm sóc nha khoa.</li>
                </ul>
            `
        },
        'card2': {
            title: 'Công cụ Tâm lý - Xã hội: Văn hóa "Đối tác"',
            img: 'https://images.unsplash.com/photo-15222071823916-2e06180562e8?q=80&w=800',
            content: `
                <p><strong>Xóa bỏ cấp bậc:</strong> Mọi nhân viên đều được gọi là "Đối tác" (Partner). Quản lý không có văn phòng riêng, cùng pha chế và dọn dẹp với nhân viên.</p>
                <p><strong>Sứ mệnh kết nối:</strong></p>
                <ul>
                    <li><strong>Bằng chứng:</strong> Dự án hỗ trợ nông dân trồng cà phê bền vững (C.A.F.E Practices).</li>
                    <li><strong>Nguyên nhân:</strong> Nhân viên tự hào vì công việc đóng góp vào sự phát triển bền vững toàn cầu.</li>
                    <li><strong>Hậu quả:</strong> Tăng chỉ số gắn kết (Engagement Score 88%) và lòng trung thành.</li>
                </ul>
            `
        },
        'card3': {
            title: 'Công cụ Nội dung công việc: Quyền tự chủ',
            img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800',
            content: `
                <p><strong>Trao quyền sáng tạo (Thuyết Herzberg):</strong></p>
                <p>Barista được khuyến khích tương tác cá nhân với khách hàng (viết lời chúc lên cốc) mà không cần kịch bản. Thậm chí được quyền tự ý pha lại ly nước mới nếu khách không hài lòng.</p>
                <p><strong>Lộ trình thăng tiến (Growth Path):</strong></p>
                <ul>
                    <li><strong>Bằng chứng:</strong> Hơn 70% Quản lý xuất thân từ vị trí Barista.</li>
                    <li><strong>Kết quả:</strong> Nhân viên ở lại vì thấy được tương lai "được lớn lên mỗi ngày".</li>
                </ul>
            `
        }
    };

    // Mở Popup sang trọng
    function openModal(cardId) {
        const modal = document.getElementById('read-more-modal');
        const data = modalData[cardId];
        
        // 1. Đổ dữ liệu vào
        document.getElementById('modal-img').src = data.img;
        document.getElementById('modal-title').innerText = data.title;
        document.getElementById('modal-desc').innerHTML = data.content;
        
        // 2. KHÓA CUỘN NỀN (Body Scroll Lock) - UX Cực kỳ quan trọng
        document.body.style.overflow = 'hidden';
        
        // 3. Hiển thị modal (dùng requestAnimationFrame để đảm bảo animation CSS chạy mượt)
        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    // Đóng Popup sang trọng
    function closeModal() {
        const modal = document.getElementById('read-more-modal');
        
        // 1. Gỡ class active để chạy hiệu ứng tắt
        modal.classList.remove('active');
        
        // 2. Chờ hiệu ứng CSS chạy xong (500ms) rồi mới ẩn hẳn đi và mở lại scroll nền
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Mở khóa cuộn trang
        }, 500); 
    }

    // Đóng khi click ra ngoài vùng xám
    window.onclick = function(event) {
        const modal = document.getElementById('read-more-modal');
        if (event.target == modal) {
            closeModal();
        }
    }

    // Hỗ trợ đóng bằng phím ESC trên bàn phím (Chuẩn Accessibility)
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            closeModal();
        }
    });