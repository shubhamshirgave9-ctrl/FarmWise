from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, farms, expenses, yields, reports, charts, dashboard

app = FastAPI(
    title="AgriSmart Backend API",
    description="Backend API for AgriSmart - Farm Management System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(farms.router)
app.include_router(expenses.router)
app.include_router(yields.router)
app.include_router(reports.router)
app.include_router(charts.router)
app.include_router(dashboard.router)


@app.get("/")
async def root():
    return {
        "message": "AgriSmart Backend API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


