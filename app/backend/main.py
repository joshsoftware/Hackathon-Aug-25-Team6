from fastapi import Depends, FastAPI, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from . import database, models, schema

# create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str):
    return pwd_context.hash(password)


@app.post(
    "/signup", response_model=schema.UserResponse, status_code=status.HTTP_201_CREATED
)
def signup(user: schema.UserSignup, db: Session = Depends(database.get_db)):
    # check if user already exists
    db_user = (
        db.query(models.Candidate).filter(models.Candidate.email == user.email).first()
    )
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )

    # create new user
    hashed_pw = get_password_hash(user.password)
    new_user = models.Candidate(
        email=user.email, name=user.name, hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return schema.UserResponse(
        id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        message="User created successfully",
    )
