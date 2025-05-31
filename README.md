### Smart Learning App

## Yêu cầu hệ thống

- Python >= 3.10
- Node.js >= 18 & npm >= 9
- PostgreSQL
- Git
- Docker & Docker Compose (Tùy chọn)

## 1. Clone dự án

```bash
git clone https://github.com/HuyTrieuNg/QLDA_22NH10_G2_Fantastic4.git
cd /path-to-your-project
```

## 2. Thiết lập môi trường backend (Django)

```bash
cd backend
python -m venv ../env
source ../env/bin/activate
pip install -r requirements.txt
cp backend/.env.example backend/.env  # Nếu có file mẫu .env
```

- Cấu hình file `.env` (nếu có) cho database, secret key, ...
- Tạo database (nếu dùng PostgreSQL)

### Chạy migrate và tạo superuser:

```bash
python manage.py migrate
python manage.py createsuperuser
```

### Chạy server backend:

```bash
python manage.py runserver
```

## 3. Thiết lập môi trường frontend (React)

```bash
cd ../frontend
npm install
```

### Chạy server frontend:

```bash
npm run dev
```

- Truy cập: http://localhost:5173

## 4. Chạy bằng Docker (tuỳ chọn)

```bash
docker-compose up --build
```
