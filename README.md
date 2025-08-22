prerequisite:
    Python version: 3.13.5

#install requirements
    pip install -r requirements.txt

#set environment variable
    Add env DATABASE_URL

#Run fast api
    uvicorn app.backend.main:app

#Swagger
    http://localhost:8000/docs
