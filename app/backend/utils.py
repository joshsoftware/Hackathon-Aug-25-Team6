import os
import shutil
from datetime import datetime
import uuid

from fastapi import HTTPException, UploadFile, status
from minio import Minio, S3Error
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


def upload_file_to_minio(file: UploadFile, bucket_name: str, client: Minio) -> str:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDFs are allowed")
    
    file_extension = file.filename.split(".")[-1]
    object_name = f"{uuid.uuid4()}.{file_extension}"

    try:
        client.put_object(
            bucket_name,
            object_name,
            file.file,
            length=-1,
            part_size=10*1024*1024
        )
    except S3Error as e:
        raise HTTPException(status_code=500, detail=f"MinIO error: {e}")
    
    # Return direct URL to access file
    return f"http://localhost:9000/{bucket_name}/{object_name}"
