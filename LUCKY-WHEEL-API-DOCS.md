# Tài liệu API Toàn diện - Vòng quay may mắn

Tài liệu này là nguồn tham khảo duy nhất và đầy đủ nhất cho tất cả các API của hệ thống Vòng quay may mắn.

**Phiên bản nghiệp vụ:** v4 - Chuỗi Phần thưởng Ngẫu nhiên.

## Mục lục
1.  [Tổng quan về Nghiệp vụ Cốt lõi](#i-tổng-quan-về-nghiệp-vụ-cốt-lõi)
2.  [API Xác thực (Authentication)](#ii-api-xác-thực-authentication)
3.  [API Công khai (Public-Facing)](#iii-api-công-khai-public-facing)
4.  [API Quản trị (Admin-Only)](#iv-api-quản-trị-admin-only)
    -   [Quản lý Nhân viên](#quản-lý-nhân-viên)
    -   [Quản lý Giải thưởng](#quản-lý-giải-thưởng)
    -   [Thống kê & Lịch sử](#thống-kê--lịch-sử)
    -   [Quản lý Admin](#quản-lý-admin)

---

## I. Tổng quan về Nghiệp vụ Cốt lõi

Hệ thống xoay quanh luồng quay thưởng dành cho nhân viên, dựa trên cơ chế "Hộp Quà Định Sẵn" để tăng sự hấp dẫn và đảm bảo tính công bằng.

### 1. Gói Lượt Quay Động
Số lượt quay của nhân viên được **tự động tính toán** dựa trên `số máy bán được`:
-   **1-4 máy:** Cấp **1 lượt quay**.
-   **5-9 máy:** Cấp **3 lượt quay**.
-   **>= 10 máy:** Cấp **6 lượt quay**.

### 2. Hệ thống "Hộp Quà Định Sẵn" (Pre-generated Loot Box)
Khi nhân viên đủ điều kiện nhận gói lượt quay (khi được tạo hoặc nâng cấp), hệ thống sẽ **tạo ra trước một chuỗi các Bậc giải thưởng** (`spinTierSequence`) và lưu lại.
-   **Gói 1 lượt:** Chuỗi là `[1]`.
-   **Gói 3 lượt:** Chuỗi cố định `[1, 2, 2]` (1 giải thường, 2 giải khá).
-   **Gói 6 lượt:** Hệ thống lấy bộ `[1, 1, 1, 1, 2, 3]` và **xáo trộn (shuffle)** để tạo ra một chuỗi ngẫu nhiên.

### 3. Luồng Quay thưởng
1.  Nhân viên nhập mã ở màn hình quay.
2.  Hệ thống dùng API `GET /api/employees/verify/:employeeCode` để xác thực và lấy thông tin.
3.  Khi nhân viên bấm Quay, hệ thống gọi `POST /api/spins/employee`.
4.  Backend đọc `spinsUsed` (số lượt đã dùng) để làm chỉ mục (index).
5.  Backend lấy ra Bậc giải thưởng từ chuỗi `spinTierSequence` tại chỉ mục đó.
6.  Backend tìm tất cả giải thưởng thuộc Bậc đó và tiến hành quay số dựa trên `probability` của từng giải.
7.  Backend tăng `spinsUsed` lên 1 và trả kết quả.

> **Về Tỷ lệ (Probability):** Để tạo ra các "lượt quay chắc chắn trúng" (ví dụ cho Bậc 3), tổng `probability` của tất cả các giải thưởng trong Bậc đó phải bằng 100.

---

## II. API Xác thực (Authentication)
Dành cho việc đăng nhập và quản lý phiên của Admin.

### 1. Đăng nhập Admin
-   **Endpoint:** `POST /api/auth/login`
-   **Tham số:** `email`, `password`
-   **Phản hồi:** Trả về `accessToken` trong header và `refreshToken` trong cookie.

### 2. Lấy thông tin Admin hiện tại
-   **Endpoint:** `GET /api/auth/me`
-   **Yêu cầu:** Header `Authorization: Bearer <token>`
-   **Phản hồi:** Thông tin chi tiết của Admin đang đăng nhập.

### 3. Làm mới Access Token
-   **Endpoint:** `POST /api/auth/refresh-token`
-   **Yêu cầu:** Cookie `refreshToken` hợp lệ.
-   **Phản hồi:** Cấp `accessToken` mới trong header.

### 4. Đăng xuất
-   **Endpoint:** `POST /api/auth/logout`
-   **Yêu cầu:** Cookie `refreshToken`.
-   **Phản hồi:** Hủy `refreshToken` và xóa cookie.

---

## III. API Công khai (Public-Facing)
Các API mà giao diện quay số sẽ sử dụng.

### 1. Xác thực Mã nhân viên
-   **Endpoint:** `GET /api/employees/verify/:employeeCode`
-   **Mô tả:** Bước đầu tiên, kiểm tra mã nhân viên và lấy thông tin cơ bản.
-   **Phản hồi:**
    ```json
    {
        "exists": true,
        "employee": {
            "name": "Trần Thị Bích",
            "remainingSpins": 6,
            "machinesSold": 11
        }
    }
    ```

### 2. Thực hiện Quay thưởng
-   **Endpoint:** `POST /api/spins/employee`
-   **Mô tả:** API cốt lõi để thực hiện một lượt quay.
-   **Tham số:** `{"employeeCode": "NV001"}`
-   **Phản hồi:**
    ```json
    {
        "success": true,
        "data": {
            "spin": { /* ... chi tiết lượt quay ... */ },
            "isWin": true,
            "remainingSpins": 5
        }
    }
    ```

---

## IV. API Quản trị (Admin-Only)
Tất cả các API trong phần này đều yêu cầu Header `Authorization: Bearer <token>`.

### Quản lý Nhân viên
-   **`POST /api/employees`**: Tạo nhân viên mới. Chuỗi phần thưởng (`spinTierSequence`) sẽ được tự động tạo.
-   **`GET /api/employees`**: Lấy danh sách tất cả nhân viên.
-   **`GET /api/employees/:id`**: Lấy chi tiết một nhân viên.
-   **`PUT /api/employees/:id`**: Cập nhật nhân viên. Nếu nâng cấp gói lượt quay, chuỗi mới sẽ được tạo.
-   **`DELETE /api/employees/:id`**: Xóa nhân viên.

### Quản lý Giải thưởng
-   **`POST /api/prizes`**: Tạo giải thưởng mới. Cần cung cấp `name`, `probability`, `tier`, `originalQuantity`.
-   **`GET /api/prizes/all`**: Lấy danh sách tất cả giải thưởng (kể cả giải không hoạt động).
-   **`GET /api/prizes/:id`**: Lấy chi tiết một giải thưởng.
-   **`PUT /api/prizes/:id`**: Cập nhật một giải thưởng.
-   **`DELETE /api/prizes/:id`**: Xóa một giải thưởng.

### Thống kê & Lịch sử
-   **`GET /api/spins`**: Lấy lịch sử tất cả các lượt quay, có phân trang.
-   **`GET /api/spins/stats`**: Lấy thống kê tổng quan (tổng lượt quay, tổng giải đã trúng...).
-   **`GET /api/spins/user/:userId`**: Lấy lịch sử quay của một người dùng cụ thể (nghiệp vụ cũ, có thể không còn dùng).

### Quản lý Admin
-   **`POST /api/auth/register`**: Tạo một tài khoản Admin mới. Yêu cầu quyền Admin. 