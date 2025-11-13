<<<<<<< HEAD
# AgriSmart Backend API

A scalable FastAPI backend for farm management system with OTP-based authentication, expense tracking, yield management, and profit/loss reporting.

## 🚀 Features

- **OTP-based Authentication** via Twilio SMS
- **Farm Management** - Add and manage multiple farms
- **Expense Tracking** - Record farm expenses by category
- **Yield Management** - Track crop sales and income
- **Profit/Loss Reports** - Calculate net profit per farm
- **Expense Charts** - Visualize expense trends over time
- **Dashboard** - Farm summary with profit percentage

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL database
- Twilio account (for SMS OTP)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   - Copy `.env` file and update with your credentials:
     ```env
     DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/agris_db
     JWT_SECRET_KEY=your-secret-key-here
     TWILIO_ACCOUNT_SID=your_twilio_sid
     TWILIO_AUTH_TOKEN=your_twilio_token
     TWILIO_PHONE_NUMBER=+1234567890
     ```

5. **Set up database**
   ```bash
   # Create database in PostgreSQL
   createdb agris_db
   
   # Run migrations
   alembic revision --autogenerate -m "init tables"
   alembic upgrade head
   ```

6. **Run the server**
   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔐 Authentication Flow

1. **Register**: `POST /auth/register`
   - Sends OTP to phone number
   
2. **Request OTP**: `POST /auth/request-otp`
   - Request new OTP for login
   
3. **Verify OTP**: `POST /auth/verify-otp`
   - Verify OTP and get JWT tokens

All subsequent requests require Bearer token in Authorization header.

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/request-otp` - Request OTP
- `POST /auth/verify-otp` - Verify OTP and login

### Farms
- `POST /farms` - Create new farm
- `GET /farms` - Get all farms
- `GET /farms/{farm_id}` - Get specific farm

### Expenses
- `POST /expenses` - Add expense
- `GET /expenses/farm/{farm_id}` - Get farm expenses

### Yields
- `POST /yields` - Add crop yield/sale
- `GET /yields/farm/{farm_id}` - Get farm yields

### Reports
- `GET /reports/farm/{farm_id}` - Get profit/loss report

### Charts
- `GET /charts/expenses?farmId={id}&from={date}&to={date}` - Get expense trends

### Dashboard
- `GET /dashboard/farm-summary?farmId={id}` - Get farm summary

## 🗄️ Database Models

- **User**: User accounts with phone-based authentication
- **Farm**: Farm details with location
- **Expense**: Farm expenses by category
- **Yield**: Crop sales and income records

## 🔧 Development

### Running Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── database.py          # Database setup
│   ├── models/              # SQLAlchemy models
│   ├── routes/              # API routes
│   ├── schemas/             # Pydantic schemas
│   └── utils/               # Utility functions
├── alembic/                 # Migration scripts
├── requirements.txt
├── .env
└── README.md
```

## 🧪 Testing

For development without Twilio, the OTP will be printed to console. Update `.env` with your Twilio credentials for production.

## 📝 License

MIT License


=======
# FarmWise
>>>>>>> e6da717669f69326d19c3b50f03ac17f6c953837
