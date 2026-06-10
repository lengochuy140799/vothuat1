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

## 🌐 Triển khai Lên Cloud (Vercel + Railway)

Hệ thống đã được thiết kế sẵn sàng để triển khai song song: **Angular** trên **Vercel** và **Spring Boot** trên **Railway**.

### 1. Cấu hình Môi trường Frontend (Angular)
Để kết nối linh hoạt giữa môi trường Local và Production, hệ thống sử dụng các tệp tin cấu hình môi trường Angular (`src/environments/`):
*   **Local (`environment.ts`)**: Mặc định kết nối tới API local `http://localhost:8080/api`.
*   **Production (`environment.prod.ts`)**: Tự động kích hoạt khi chạy lệnh build production (`npm run build`). API URL mặc định là URL của dự án Railway của bạn.

#### Cách cấu hình URL Backend động trên Vercel:
Có 2 cách để quý thầy/cô liên kết Frontend trên Vercel tới Backend trên Railway:
*   **Cách 1 (Sửa trực tiếp):** Vào tệp `src/environments/environment.prod.ts` và thay giá trị ở trường `'https://vothuat-backend.up.railway.app/api'` thành địa chỉ Backend Railway thực tế của bạn trước khi đẩy code lên git.
*   **Cách 2 (Độ linh hoạt cao - Không cần build lại):** Dự án hỗ trợ đọc cấu hình động trực tiếp từ biến toàn cục của trình duyệt. Tại trang cấu hình Vercel (Settings -> Environment Variables), quý thầy/cô có thể khai báo một biến script hoặc đơn giản là cho phép trình duyệt của khách hàng nạp biến qua `index.html` hoặc thiết lập biến `API_URL`.

### 2. Sửa lỗi CORS (Cross-Origin Resource Sharing)
Khi chạy Frontend ở URL Vercel (ví dụ: `https://vothuat.vercel.app`) và Backend ở Railway, trình duyệt sẽ chặn yêu cầu nếu không được cấp phép CORS.

#### Các bước xử lý triệt để lỗi CORS:
1.  **Thêm URL Vercel của bạn vào danh sách cho phép của Backend:**
    Mở file cấu hình bảo mật backend tại: `/backend/src/main/java/com/mabu/system/config/SecurityConfig.java`
2.  Tìm đến phương thức `@Bean public CorsConfigurationSource corsConfigurationSource()` và đảm bảo rằng URL Vercel của bạn đã nằm trong danh sách `setAllowedOrigins`:
    ```java
    config.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://localhost:3000",
            "https://vothuat.vercel.app",  // <-- Thêm URL Vercel chính thức của bạn tại đây
            "https://ten-du-an-cua-ban.vercel.app" 
    ));
    ```
3.  **Deploy lại Backend:** Khi đẩy Code mới có URL này lên Railway, Backend sẽ tự động chấp nhận mọi Request truyền tài khoản, thông tin võ sinh và học phí từ trang Vercel của bạn.

---

## 💡 Các Lưu Ý Quan Trọng Khi Phát Triển

*   **Tách biệt Backend & Frontend**: Trong quá trình phát triển, hãy đảm bảo cả Spring Boot (Port 8080) và Angular (Port 3000) đều được khởi chạy đồng thời.
*   **Lưu Trạng Thái Tab Hoạt Động (F5 Persistence)**: Hệ thống đã tích hợp tính năng lưu trạng thái Tab hiện tại thông qua `localStorage` (ví dụ: Tab Đợt thi lên đai). Khi người dùng nhấn tải lại trang (F5), Angular sẽ tự động phục hồi giao diện Tab đang làm việc trước đó mà không bị nhảy về Tab mặc định.
*   **Bảo Mật & JWT Token**: Mọi yêu cầu bảo mật có tích hợp khóa JWT bí mật mặc định có thể chỉnh sửa tự do thông qua tham số `jwt.secret` nằm tại `application.yml` khi bàn giao lên môi trường Production thực tế.
*   **Xuất Báo Cáo Excel**: Tính năng xuất / nhập dữ liệu Excel được xử lý trực quan qua phông nền động, tối ưu hóa các thao tác xử lý tập tin mà không cần phần mềm phụ trợ.

Chúc các thầy cô và ban quản trị võ đường vận hành hệ sinh thái quản lý võ sinh hiệu quả nhất! 🥋✨
