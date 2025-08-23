from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.backend import database, models, schema
from app.backend.service.question_analysis import QuestionAnalysisService

score_router = APIRouter()


@score_router.post("/questions/score", response_model=schema.QuestionScoreBatchResponse)
async def batch_score_questions(
    candidate_id: int,
    job_id: int,
    application_id: int,
    db: Session = Depends(database.get_db),
):
    db_application = (
        db.query(models.JobApplication)
        .filter(models.JobApplication.id == application_id)
        .first()
    )

    if not db_application:
        raise HTTPException(status_code=404, detail="Job application not found")

    db_job = db.query(models.Job).filter(models.Job.job_id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Extract years of experience from application
    yoe = db_application.experience_years

    # Extract primary skill from job required_skills
    primary_skill = (
        db_job.required_skills.split(",")[0] if db_job.required_skills else "General"
    )

    # Fetch all questions and answers for candidate and job
    db_question_answers = (
        db.query(models.QuestionAnswer)
        .filter(models.QuestionAnswer.candidate_id == candidate_id)
        .all()
    )
    if not db_question_answers:
        raise HTTPException(
            status_code=404, detail="No question answers found for candidate"
        )

    # Prepare question-answer pairs for analysis
    qa_pairs = []
    for qa in db_question_answers:
        # Get the question text
        question = (
            db.query(models.Question)
            .filter(models.Question.id == qa.question_id)
            .first()
        )
        if question:
            qa_pairs.append(
                {
                    "question_id": qa.question_id,
                    "question": question.text,
                    "answer": qa.answer,
                }
            )

    if not qa_pairs:
        raise HTTPException(
            status_code=404, detail="No valid question-answer pairs found"
        )

    # Initialize the question analysis service
    analysis_service = QuestionAnalysisService()

    try:
        # Analyze the question-answer pairs
        analysis_results = analysis_service.analyze_questions(
            qa_pairs,
            role="Software Engineer",  # This could be made dynamic based on job details
            yoe=5,
            skill="react",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Question analysis failed: {str(e)}"
        )

    # Store the results in the database
    results = []
    for result in analysis_results:
        question_id = result["question_id"]
        scores = result.get("scores", {})
        print(result)
        # Create or update the question score
        db_score = models.QuestionScore(
            application_id=application_id,
            candidate_id=candidate_id,
            question_id=question_id,
            technical_correctness=scores.get("technical_correctness", 0),
            specificity_depth=scores.get("specificity_depth", 0),
            reasoning_quality=scores.get("reasoning_quality", 0),
            real_world_signals=scores.get("real_world_signals", 0),
            communication=scores.get("communication", 0),
            final_score=result.get("final_score_10", 0),
            verdict=result.get("verdict", "fail"),
            improvement_tips=(
                ", ".join(result.get("improvement_tips", []))
                if isinstance(result.get("improvement_tips"), list)
                else result.get("improvement_tips", "")
            ),
        )

        db.add(db_score)
        db.commit()
        db.refresh(db_score)

        results.append(
            {
                "question_id": db_score.question_id,
                "score": db_score.final_score,
                "verdict": db_score.verdict,
                "message": "Question score created successfully",
            }
        )

    return {"results": results}


@score_router.post(
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


@score_router.get(
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


@score_router.put(
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


@score_router.delete("/questions/{question_id}/score")
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
