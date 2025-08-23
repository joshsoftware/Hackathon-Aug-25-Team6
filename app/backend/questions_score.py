from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.backend import database, models, schema, security

question_score_router = APIRouter(prefix="/question-scores", tags=["Question Scores"])

@question_score_router.get("/")
async def get_question_scores(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get all question scores for the current user"""
    return {"message": "Question scores endpoint"}

@question_score_router.post("/")
async def create_question_score(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Create a new question score"""
    return {"message": "Question score created"}