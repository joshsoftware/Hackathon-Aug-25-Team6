import os

import requests
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.backend import database, models, schema

question_score_router = APIRouter()


@question_score_router.post("/questions/score/batch")
async def batch_score_questions(
    candidate_id: int,
    job_id: int,
    db: Session = Depends(database.get_db),
):
    # Fetch all questions and answers for candidate and job
    db_questions = (
        db.query(models.Question)
        .filter(
            models.Question.candidate_id == candidate_id,
            models.Question.job_id == job_id,
        )
        .all()
    )
    if not db_questions:
        raise HTTPException(
            status_code=404, detail="No questions found for candidate and job"
        )

    qa_pairs = []
    for q in db_questions:
        qa_pairs.append(
            {
                "question_id": q.id,
                "question": q.text,  # adjust field name as per your model
                "answer": q.answer,  # adjust field name as per your model
            }
        )

    # Prepare prompt for Claude
    prompt_path = os.path.join(
        os.path.dirname(__file__), "../prompts/questionAnalysis.py"
    )
    with open(prompt_path, "r") as f:
        prompt = f.read()

    # Prepare Anthropic Claude API payload
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
    if not anthropic_api_key:
        raise HTTPException(status_code=500, detail="Anthropic API key not set")
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": anthropic_api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    # Construct message for Claude
    user_content = prompt + "\n" + str(qa_pairs)
    payload = {
        "model": "claude-3-sonnet-20240229",
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": user_content}],
    }
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Anthropic Claude API error")
    # Parse Claude response (assume response contains scores in a structured format)
    result = response.json()
    # You may need to parse result['content'] to extract scores
    # For now, assume it's a list of dicts: [{"question_id": ..., "score": ...}, ...]
    scores = result.get("scores", [])

    results = []
    for score_obj in scores:
        db_score = models.QuestionScore(
            question_id=score_obj["question_id"],
            score=score_obj["score"],
        )
        db.add(db_score)
        db.commit()
        db.refresh(db_score)
        results.append(
            {
                "question_id": db_score.question_id,
                "score": db_score.score,
                "message": "Score stored successfully",
            }
        )
    return {"results": results}


@question_score_router.post(
    "/questions/{question_id}/score", response_model=schema.QuestionScoreResponse
)
async def create_question_score(
    question_id: int,
    score: schema.QuestionScoreCreate,
    db: Session = Depends(database.get_db),
):
    db_question = (
        db.query(models.Question).filter(models.Question.id == question_id).first()
    )
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")

    db_score = models.QuestionScore(**score.model_dump(), question_id=question_id)
    db.add(db_score)
    db.commit()
    db.refresh(db_score)

    return schema.QuestionScoreResponse(
        id=db_score.id,
        question_id=db_score.question_id,
        score=db_score.score,
        message="Question score created successfully",
    )


@question_score_router.get(
    "/questions/{question_id}/score", response_model=schema.QuestionScoreResponse
)
async def read_question_score(question_id: int, db: Session = Depends(database.get_db)):
    db_score = (
        db.query(models.QuestionScore)
        .filter(models.QuestionScore.question_id == question_id)
        .first()
    )
    if not db_score:
        raise HTTPException(status_code=404, detail="Question score not found")
    return schema.QuestionScoreResponse(
        id=db_score.id,
        question_id=db_score.question_id,
        score=db_score.score,
        message="Question score retrieved successfully",
    )


@question_score_router.put(
    "/questions/{question_id}/score", response_model=schema.QuestionScoreResponse
)
async def update_question_score(
    question_id: int,
    score: schema.QuestionScoreCreate,
    db: Session = Depends(database.get_db),
):
    db_score = (
        db.query(models.QuestionScore)
        .filter(models.QuestionScore.question_id == question_id)
        .first()
    )
    if not db_score:
        raise HTTPException(status_code=404, detail="Question score not found")

    db_score.score = score.score
    db.add(db_score)
    db.commit()
    db.refresh(db_score)

    return schema.QuestionScoreResponse(
        id=db_score.id,
        question_id=db_score.question_id,
        score=db_score.score,
        message="Question score updated successfully",
    )


@question_score_router.delete("/questions/{question_id}/score")
async def delete_question_score(
    question_id: int, db: Session = Depends(database.get_db)
):
    db_score = (
        db.query(models.QuestionScore)
        .filter(models.QuestionScore.question_id == question_id)
        .first()
    )
    if not db_score:
        raise HTTPException(status_code=404, detail="Question score not found")

    db.delete(db_score)
    db.commit()

    return {"message": "Question score deleted successfully"}
