from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.backend import database, models, schema

question_router = APIRouter()


@question_router.post(
    "/questions/",
    response_model=schema.QuestionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_question(
    question: schema.QuestionCreate, db: Session = Depends(database.get_db)
):
    db_question = models.Question(**question.model_dump())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return schema.QuestionResponse(
        id=db_question.id,
        text=db_question.text,
        tags=question.tags,
        message="Question created successfully",
    )


@question_router.get("/questions/{question_id}", response_model=schema.QuestionResponse)
async def read_question(question_id: int, db: Session = Depends(database.get_db)):
    question = (
        db.query(models.Question).filter(models.Question.id == question_id).first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return schema.QuestionResponse(
        id=question.id,
        text=question.text,
        tags=question.tags,
        message="Question retrieved successfully",
    )


@question_router.put("/questions/{question_id}", response_model=schema.QuestionResponse)
async def update_question(
    question_id: int,
    question: schema.QuestionCreate,
    db: Session = Depends(database.get_db),
):
    db_question = (
        db.query(models.Question).filter(models.Question.id == question_id).first()
    )
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Update the question fields
    db_question.text = question.text
    db_question.tags = question.tags
    db.add(db_question)
    db.commit()
    db.refresh(db_question)

    return schema.QuestionResponse(
        id=db_question.id,
        text=db_question.text,
        tags=db_question.tags,
        message="Question updated successfully",
    )


@question_router.delete("/questions/{question_id}")
async def delete_question(question_id: int, db: Session = Depends(database.get_db)):
    db_question = (
        db.query(models.Question).filter(models.Question.id == question_id).first()
    )
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(db_question)
    db.commit()

    return {"message": "Question deleted successfully"}
