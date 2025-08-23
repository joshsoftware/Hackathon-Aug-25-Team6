from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.backend import database, models, schema

question_answer_router = APIRouter()


@question_answer_router.post(
    "/question_response/",
    response_model=schema.QuestionAnswerResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_answer(
    answer: schema.QuestionAnswerCreate, db: Session = Depends(database.get_db)
):
    db_answer = models.QuestionAnswer(**answer.dict())
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return schema.QuestionAnswerResponse(
        **db_answer.__dict__, message="Answer submitted successfully"
    )


@question_answer_router.get(
    "/question_response/{answer_id}",
    response_model=schema.QuestionAnswerResponse,
    status_code=status.HTTP_200_OK,
)
def get_answer(answer_id: int, db: Session = Depends(database.get_db)):
    db_answer = (
        db.query(models.QuestionAnswer)
        .filter(models.QuestionAnswer.id == answer_id)
        .first()
    )
    if not db_answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    return schema.QuestionAnswerResponse(**db_answer.__dict__)


@question_answer_router.put(
    "/question_response/{answer_id}",
    response_model=schema.QuestionAnswerResponse,
    status_code=status.HTTP_200_OK,
)
def update_answer(
    answer_id: int,
    answer: schema.QuestionAnswerCreate,
    db: Session = Depends(database.get_db),
):
    db_answer = (
        db.query(models.QuestionAnswer)
        .filter(models.QuestionAnswer.id == answer_id)
        .first()
    )
    if not db_answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    for key, value in answer.dict().items():
        setattr(db_answer, key, value)
    db.commit()
    db.refresh(db_answer)
    return schema.QuestionAnswerResponse(
        **db_answer.__dict__, message="Answer updated successfully"
    )


@question_answer_router.delete(
    "/question_response/{answer_id}", response_model=schema.QuestionAnswerResponse
)
def delete_answer(answer_id: int, db: Session = Depends(database.get_db)):
    db_answer = (
        db.query(models.QuestionAnswer)
        .filter(models.QuestionAnswer.id == answer_id)
        .first()
    )
    if not db_answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    db.delete(db_answer)
    db.commit()
    return schema.QuestionAnswerResponse(
        **db_answer.__dict__, message="Answer deleted successfully"
    )
