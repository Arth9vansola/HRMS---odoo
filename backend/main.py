from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all routers
from routes import auth, users, attendance, leaves, payroll, analytics

app = FastAPI(title="WorkZen HRMS", version="1.0.0")

# Setup CORS
origins = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(attendance.router)
app.include_router(leaves.router)
app.include_router(payroll.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {"message": "WorkZen HRMS API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.get("/health")
def health():
    return {"status": "healthy"}
