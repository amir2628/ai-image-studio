from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from typing import Optional, AsyncGenerator
import os
import uuid
import aio_pika
import json
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from sqlalchemy.sql import text

from models import Base, Generation
from database import get_db, init_db
from rabbitmq import init_rabbitmq, publish_message, close_rabbitmq

app = FastAPI(title="Stable Diffusion ControlNet API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directory for uploaded and generated images
os.makedirs("./uploads", exist_ok=True)
os.makedirs("./generations", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/generations", StaticFiles(directory="generations"), name="generations")

@app.on_event("startup")
async def startup_event():
    await init_db()
    await init_rabbitmq()

@app.on_event("shutdown")
async def shutdown_event():
    await close_rabbitmq()

@app.post("/api/generate")
async def generate_image(
    background_tasks: BackgroundTasks,
    image: UploadFile = File(...),
    prompt: str = Form(...),
    preprocessor: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    # Validate preprocessor
    if preprocessor not in ["canny", "pose", "depth"]:
        raise HTTPException(status_code=400, detail="Invalid preprocessor type")
    
    # Generate unique ID for this generation
    generation_id = str(uuid.uuid4())
    
    # Save uploaded image
    image_path = f"uploads/{generation_id}.png"
    with open(image_path, "wb") as buffer:
        buffer.write(await image.read())
    
    # Create new generation record in database
    new_generation = Generation(
        id=generation_id,
        prompt=prompt,
        preprocessor=preprocessor,
        input_image_path=image_path,
        status="processing",
        created_at=datetime.now()
    )
    
    db.add(new_generation)
    await db.commit()
    
    # Add task to RabbitMQ queue
    task = {
        "id": generation_id,
        "prompt": prompt,
        "preprocessor": preprocessor,
        "image_path": image_path
    }
    
    # Publish message to RabbitMQ
    await publish_message(json.dumps(task))
    
    # Return response with generation ID
    return JSONResponse({
        "id": generation_id,
        "status": "processing",
        "message": "Generation task queued successfully"
    })

@app.get("/api/generations/{generation_id}")
async def get_generation_status(
    generation_id: str,
    db: AsyncSession = Depends(get_db)
):
    # Query the generation from database
    # result = await db.execute(
    #     "SELECT * FROM generations WHERE id = :id",
    #     {"id": generation_id}
    # )
    result = await db.execute(
        text("SELECT * FROM generations WHERE id = :id"),
        {"id": generation_id}
    )
    generation = result.fetchone()
    
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    response = {
        "id": generation.id,
        "status": generation.status,
        "prompt": generation.prompt,
        "preprocessor": generation.preprocessor,
        "created_at": generation.created_at.isoformat()
    }
    
    # Add result URL if generation is completed
    if generation.status == "completed" and generation.output_image_path:
        response["resultUrl"] = f"http://localhost:8000/{generation.output_image_path}"
    
    # Add error message if generation failed
    if generation.status == "error":
        response["error"] = generation.error_message
    
    return response

@app.get("/api/generations")
async def get_generation_history(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    # Get recent generations from database
    result = await db.execute(
        "SELECT * FROM generations ORDER BY created_at DESC LIMIT :limit",
        {"limit": limit}
    )
    generations = result.fetchall()
    
    response = []
    for gen in generations:
        gen_data = {
            "id": gen.id,
            "status": gen.status,
            "prompt": gen.prompt,
            "preprocessor": gen.preprocessor,
            "created_at": gen.created_at.isoformat()
        }
        
        if gen.status == "completed" and gen.output_image_path:
            gen_data["resultUrl"] = f"http://localhost:8000/{gen.output_image_path}"
        
        if gen.status == "error":
            gen_data["error"] = gen.error_message
            
        response.append(gen_data)
    
    return response