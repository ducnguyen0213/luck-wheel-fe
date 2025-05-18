# Vòng Quay May Mắn 🎉

Project vòng quay may mắn với Frontend được phát triển bằng Next.js, giao diện hiện đại và trải nghiệm người dùng tuyệt vời.

## 📝 Tổng quan

Ứng dụng Vòng Quay May Mắn cho phép người dùng đăng nhập và quay vòng quay để có cơ hội nhận các phần thưởng giá trị. Dự án được chia thành hai phần:

- **Frontend**: Phát triển bằng Next.js 15+ và Tailwind CSS
- **Backend**: API được xây dựng với Express.js (được triển khai riêng)

## ✨ Tính năng chính

- Đăng nhập bằng thông tin cá nhân (tên, email, số điện thoại)
- Vòng quay đầy màu sắc với hiệu ứng animation mượt mà
- Hiệu ứng âm thanh khi quay và trúng thưởng
- Hiển thị kết quả với confetti và animation
- Theo dõi số lượt quay còn lại của người dùng
- Giao diện responsive cho các thiết bị

## 💅 Tính năng UI/UX

1. **Giao diện hiện đại**:
   - Sử dụng thiết kế Glassmorphism với hiệu ứng blur và độ trong suốt
   - Gradient màu sắc sống động và hiệu ứng chuyển màu
   - Font chữ Google Fonts (Poppins, Luckiest Guy) cho trải nghiệm đẹp mắt

2. **Hiệu ứng Animation**:
   - Hiệu ứng float cho các phần tử trang trí (ngôi sao)
   - Animation khi quay vòng quay với easing functions
   - Hiệu ứng confetti khi trúng thưởng lớn
   - Chuyển động của các thành phần UI theo tương tác

3. **Phản hồi tương tác**:
   - Hiệu ứng hover, focus và active states cho các phần tử tương tác
   - Hiệu ứng âm thanh khi quay và nhận kết quả
   - Hiệu ứng rung nhẹ khi vòng quay dừng lại

4. **Tối ưu trải nghiệm**:
   - Màu sắc thay đổi theo số lượt quay còn lại (xanh > vàng > đỏ)
   - Thông báo toast khi có lỗi hoặc thành công
   - Modal kết quả với hiệu ứng animation đẹp mắt

## 🚀 Cách sử dụng

1. Cài đặt các dependencies:

```bash
npm install
```

2. Chạy ứng dụng ở môi trường development:

```bash
npm run dev
```

3. Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000)

## 🛠️ Công nghệ sử dụng

- **Next.js**: Framework React cho frontend
- **TailwindCSS**: Framework CSS utility-first
- **Headless UI**: Components không styles cho xây dựng UI
- **React Toastify**: Hiển thị thông báo toast
- **Canvas Confetti**: Hiệu ứng confetti khi thắng giải
- **React Hook Form**: Xử lý form và validation
- **Zod**: Kiểm tra dữ liệu form
- **Framer Motion**: Hiệu ứng animation mượt mà

## 📄 Giấy phép

Phát triển bởi Nguyễn Đức
