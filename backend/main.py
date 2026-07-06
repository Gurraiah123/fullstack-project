from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from database import engine

app = FastAPI()

origins = [
    "http://100.26.12.194"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    id: int
    name: str
    email: str
    role: str

@app.get("/")
def home():
    return {"message": "FastAPI Backend Running"}

@app.get("/api/users")
def get_users():

    connection = engine.connect()

    try:
        result = connection.execute(text("SELECT * FROM users"))

        users = []

        for row in result:
            users.append({
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "role": row[3]
            })

        return users

    finally:
        connection.close()


@app.post("/api/users")
def create_user(user: User):

    connection = engine.connect()

    try:
        connection.execute(
            text("""
                INSERT INTO users(id, name, email, role)
                VALUES(:id, :name, :email, :role)
            """),
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        )

        connection.commit()

        return {
            "success": True,
            "message": "User inserted successfully"
        }

    except IntegrityError:
        connection.rollback()

        raise HTTPException(
            status_code=400,
            detail="User ID or Email already exists"
        )

    except Exception as e:
        connection.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        connection.close()
