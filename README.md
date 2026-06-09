# Hướng Dẫn Khởi Chạy Dự Án Mabu Dojo System 🥋

Tài liệu này hướng dẫn chi tiết cách thiết lập, cấu hình và chạy toàn bộ hệ thống quản lý võ đường **CLB Nguyễn Thanh Vũ (Mabu Dojo System)** bao gồm Cơ sở dữ liệu (Database), Backend (Spring Boot) và Frontend (Angular).

---

## 📌 Tổng Quan Hệ Thống

Hệ thống được xây dựng với cấu trúc Full-stack hiện đại:
*   **Frontend**: Angular (v19+), Tailwind CSS v4, NgRx (Quản lý trạng thái), Lucide Icons, thư viện xuất Excel.
*   **Backend**: Java Spring Boot (v3.2.x), Spring Security, JSON Web Token (JWT) để bảo mật, Spring Data JPA.
*   **Cơ sở dữ liệu (Database)**: PostgreSQL, quản lý phiên bản migration tự động thông qua **Flyway**.

---

## 🛠️ Yêu Cầu Hệ Thống (Prerequisites)

Hãy đảm bảo máy tính của bạn đã cài đặt sẵn các công cụ sau:
1.  **Java Development Kit (JDK)**: Phiên bản **17** trở lên.
2.  **Node.js**: Hoạt động ổn định nhất ở phiên bản LTS (v18, v20, v22) đi kèm với **npm**.
3.  **Cơ sở dữ liệu**: **PostgreSQL** (v14 trở lên).
4.  **Công cụ soạn thảo**: IntelliJ IDEA (khuyên dùng cho Java), Visual Studio Code (khuyên dùng cho Angular) hoặc Eclipse.

---

## 🚀 Các Bước Triển Khai & Khởi Chạy Chi Tiết

### Bước 1: Thiết Lập Cơ Sở Dữ Liệu (PostgreSQL DB)

Hệ thống sử dụng **Flyway** để quản lý DB Migration. Điều này có nghĩa bạn **không cần** chạy thủ công bất kỳ tệp tin `.sql` nào. Hệ thống sẽ tự động khởi tạo bảng dữ liệu và cấu trúc khi chạy backend lần đầu tiên.

1.  Mở công cụ quản trị PostgreSQL (ví dụ: pgAdmin, DBeaver, hoặc Terminal psql).
2.  Tạo một cơ sở dữ liệu trống mới với tên:
    ```sql
    CREATE DATABASE mabudojo;
    ```
3.  Thông tin kết nối mặc định được cấu hình trong code:
    *   **Host**: `localhost`
    *   **Port**: `5432`
    *   **Database name**: `mabudojo`
    *   **Username**: `postgres`
    *   **Password**: `postgres` (Nếu mật khẩu của bạn khác, hãy xem cách thay đổi ở Bước 2).

---

### Bước 2: Khởi Chạy Backend (Spring Boot)

Backend được đặt trong thư mục `/backend` của dự án.

1.  Sử dụng terminal di chuyển vào thư mục backend:
    ```bash
    cd backend
    ```
2.  **Cấu hình kết nối DB (Nếu cần thiết)**:
    Nếu thông tin tài khoản PostgreSQL của bạn khác với cấu hình mặc định, bạn có hai cách để cập nhật:
    *   **Cách 1 (Khuyên dùng)**: Thiết lập biến môi trường trên máy của bạn trước khi chạy:
        *   Windows (Command Prompt):
            ```cmd
            set SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ten_db_cua_ban
            set SPRING_DATASOURCE_USERNAME=user_cua_ban
            set SPRING_DATASOURCE_PASSWORD=pass_cua_ban
            ```
        *   macOS/Linux:
            ```bash
            export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ten_db_cua_ban
            export SPRING_DATASOURCE_USERNAME=user_cua_ban
            export SPRING_DATASOURCE_PASSWORD=pass_cua_ban
            ```
    *   **Cách 2**: Chỉnh sửa trực tiếp tệp cấu hình tại đường dẫn `src/main/resources/application.yml` trên máy local của bạn.

3.  **Biên dịch và Chạy Backend**: mvn spring-boot:run

    Sử dụng tệp tin Maven Wrapper đi kèm sẵn trong dự án để chạy mà không cần cài đặt thêm phần mềm Maven ngoài:
    *   **Trên Windows (cmd/PowerShell)**:
        ```bash
        mvnw.cmd spring-boot:run
        ```
    *   **Trên macOS/Linux**:
        ```bash
        chmod +x mvnw
        ./mvnw spring-boot:run
        ```

4.  **Kiểm tra kết quả**:
    *   Khi ứng dụng kích hoạt thành công, logs terminal sẽ hiện thông báo các tệp Migration Flyway được áp dụng đầy đủ.
    *   Cổng mặc định chạy: `http://localhost:8080/api`
    *   Tài liệu trực quan hóa API (Swagger UI / OpenAPI Document): Truy cập vào địa chỉ [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html) để thực nghiệm các Endpoint trực tiếp.

---

### Bước 3: Khởi Chạy Frontend (Angular)

Frontend được quản lý từ thư mục gốc của dự án. npm run dev

1.  Mở một cửa sổ Terminal mới tại thư mục gốc (không ở trong thư mục /backend):
    ```bash
    cd ..
    ```
    *(Thay đổi thư mục sao cho bạn đứng tại thư mục gốc nơi chứa file `package.json` của Angular).*

2.  **Cài đặt các gói thư viện bổ sung**:
    ```bash
    npm install
    ```

3.  **Khởi chạy máy chủ phát triển (Development Server)**:
    ```bash
    npm run dev
    ```
    *Lệnh này sẽ khởi động Angular Development Server kết nối thẳng tới cổng host mặc định.*

4.  **Kiểm tra kết quả**:
    *   Mở trình duyệt và truy cập vào: [http://localhost:3000](http://localhost:3000) (Cổng mặc định theo tệp `package.json`).
    *   Dịch vụ API client tại Angular (`src/app/services/api.service.ts`) được thiết lập mặc định để kết nối mượt mà tới REST API `http://localhost:8080/api` ở máy local của bạn.

---

## 💡 Các Lưu Ý Quan Trọng Khi Phát Triển

*   **Tách biệt Backend & Frontend**: Trong quá trình phát triển, hãy đảm bảo cả Spring Boot (Port 8080) và Angular (Port 3000) đều được khởi chạy đồng thời.
*   **Lưu Trạng Thái Tab Hoạt Động (F5 Persistence)**: Hệ thống đã tích hợp tính năng lưu trạng thái Tab hiện tại thông qua `localStorage` (ví dụ: Tab Đợt thi lên đai). Khi người dùng nhấn tải lại trang (F5), Angular sẽ tự động phục hồi giao diện Tab đang làm việc trước đó mà không bị nhảy về Tab mặc định.
*   **Bảo Mật & JWT Token**: Mọi yêu cầu bảo mật có tích hợp khóa JWT bí mật mặc định có thể chỉnh sửa tự do thông qua tham số `jwt.secret` nằm tại `application.yml` khi bàn giao lên môi trường Production thực tế.
*   **Xuất Báo Cáo Excel**: Tính năng xuất / nhập dữ liệu Excel được xử lý trực quan qua phông nền động, tối ưu hóa các thao tác xử lý tập tin mà không cần phần mềm phụ trợ.

Chúc các thầy cô và ban quản trị võ đường vận hành hệ sinh thái quản lý võ sinh hiệu quả nhất! 🥋✨
