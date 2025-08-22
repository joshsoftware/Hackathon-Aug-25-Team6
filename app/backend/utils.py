import os
import shutil
from datetime import datetime

from fastapi import HTTPException, UploadFile, status
from passlib.context import CryptContext

from app.backend import config, database


def save_upload_file(upload_file: UploadFile, email: str) -> str:
    # Create upload directory if it doesn't exist
    os.makedirs(config.UPLOAD_DIR, exist_ok=True)

    # Get file extension and check if it's allowed
    file_ext = os.path.splitext(upload_file.filename)[1].lower()
    if file_ext not in config.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed. Please upload PDF or DOC files",
        )

    # Create unique filename using timestamp and email
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{email}_{timestamp}{file_ext}"
    file_path = os.path.join(config.UPLOAD_DIR, filename)

    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path


def create_tables():
    print("Creating database tables...")
    try:
        database.Base.metadata.create_all(bind=database.engine)
        print("Tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")
