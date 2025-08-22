from pydantic import BaseModel, EmailStr


class UserSignup(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    message: str

    class Config:
        from_attributes = True
