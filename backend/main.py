from fastapi import FastAPI, WebSocket, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import httpx
import asyncio
import json
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# Secret key for JWT encoding/decoding
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class MaintenanceRequest(BaseModel):
    text: str

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Dummy user authentication
    user_role = "user"
    if form_data.username == "admin" and form_data.password == "admin":
        user_role = "admin"
    elif form_data.username == "user" and form_data.password == "user":
        user_role = "user"
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username, "role": user_role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}

@app.post("/api/maintenance/query")
def predict_maintenance(request: MaintenanceRequest, current_user: str = Depends(get_current_user)):
    # Dummy logic for now
    return {
        "status": "success",
        "message": "Maintenance prediction received",
        "data": {
            "input_text": request.text,
            "prediction": "Scheduled maintenance required in 3 days."
        }
    }

@app.websocket("/ws/temperature")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role != "admin":
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except JWTError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    try:
        while True:
            async with httpx.AsyncClient() as client:
                response = await client.get("https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&hourly=temperature_2m&current_weather=true")
                data = response.json()
                
                # Send current temperature and time
                current_weather = data.get("current_weather", {})
                await websocket.send_json({
                    "temperature": current_weather.get("temperature"),
                    "time": current_weather.get("time")
                })
            
            # Update every 2 seconds
            await asyncio.sleep(2)
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass

@app.get("/api/maintenance/events")
def get_maintenance_events(current_user: str = Depends(get_current_user)):
    # Dummy events for demonstration
    return [
        {
            "title": "Routine Checkup",
            "start": "2025-12-05",
            "color": "#3498db"
        },
        {
            "title": "Oil Change",
            "start": "2025-12-10",
            "color": "#e74c3c"
        },
        {
            "title": "Tire Rotation",
            "start": "2025-12-15",
            "color": "#2ecc71"
        },
        {
            "title": "Brake Inspection",
            "start": "2025-12-20",
            "color": "#f1c40f"
        }
    ]
