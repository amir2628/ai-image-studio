import asyncio
import aio_pika
import json
import os
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import torch
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, UniPCMultistepScheduler
from controlnet_aux import CannyDetector, MidasDetector  # Removed DwPoseDetector
from easy_dwpose import DWposeDetector  # Added easy_dwpose
from PIL import Image
import traceback
import shutil
from sqlalchemy.sql import text
from models import Base, Generation
from database import DATABASE_URL

def log_gpu_memory():
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated() / 1024**3
        reserved = torch.cuda.memory_reserved() / 1024**3
        print(f"GPU Memory: {allocated:.2f} GB allocated, {reserved:.2f} GB reserved")

def check_disk_space(path="/app"):
    total, used, free = shutil.disk_usage(path)
    print(f"Disk Space: Total={total/1024**3:.2f}GB, Used={used/1024**3:.2f}GB, Free={free/1024**3:.2f}GB")

# Create async database session
engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
print("Database session initialized successfully")

# Initialize device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
log_gpu_memory()
check_disk_space()

# Initialize preprocessors and ControlNet models
canny_processor = None
openpose_processor = None
midas_processor = None
controlnet_canny = None
controlnet_openpose = None
controlnet_depth = None

async def initialize_components():
    global canny_processor, openpose_processor, midas_processor
    global controlnet_canny, controlnet_openpose, controlnet_depth

    print("Initializing preprocessors...")
    try:
        canny_processor = CannyDetector()
        print("CannyDetector initialized")
        # Initialize DWposeDetector from easy_dwpose
        openpose_processor = DWposeDetector(device=device)
        print("DWposeDetector initialized")
        # midas_processor = MidasDetector()
        midas_processor = MidasDetector.from_pretrained("lllyasviel/Annotators")
        print("MidasDetector initialized")
    except Exception as e:
        print(f"Error initializing preprocessors: {str(e)}")
        traceback.print_exc()
        raise

    log_gpu_memory()

    print("Loading ControlNet models...")
    try:
        controlnet_canny = ControlNetModel.from_pretrained(
            "lllyasviel/sd-controlnet-canny",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32
        )
        print("ControlNet Canny loaded")
        controlnet_openpose = ControlNetModel.from_pretrained(
            "lllyasviel/sd-controlnet-openpose",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32
        )
        print("ControlNet Openpose loaded")
        controlnet_depth = ControlNetModel.from_pretrained(
            "lllyasviel/sd-controlnet-depth",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32
        )
        print("ControlNet Depth loaded")
        log_gpu_memory()
    except Exception as e:
        print(f"Error loading ControlNet models: {str(e)}")
        traceback.print_exc()
        raise

async def process_image(image_path: str, prompt: str, preprocessor: str) -> str:
    if not all([canny_processor, openpose_processor, midas_processor, controlnet_canny, controlnet_openpose, controlnet_depth]):
        await initialize_components()

    print(f"Processing image: {image_path}, Prompt: {prompt}, Preprocessor: {preprocessor}")
    try:
        image = Image.open(image_path).convert("RGB")
    except Exception as e:
        print(f"Error opening image {image_path}: {str(e)}")
        raise
    
    print("Loading Stable Diffusion pipeline...")
    try:
        loop = asyncio.get_running_loop()
        if preprocessor == "canny":
            pipe = await loop.run_in_executor(
                None,
                lambda: StableDiffusionControlNetPipeline.from_pretrained(
                    "runwayml/stable-diffusion-v1-5",
                    controlnet=controlnet_canny,
                    torch_dtype=torch.float16
                ).to(device)
            )
        elif preprocessor == "pose":
            pipe = await loop.run_in_executor(
                None,
                lambda: StableDiffusionControlNetPipeline.from_pretrained(
                    "runwayml/stable-diffusion-v1-5",
                    controlnet=controlnet_openpose,
                    torch_dtype=torch.float16
                ).to(device)
            )
        elif preprocessor == "depth":
            if midas_processor is None:
                raise ValueError("Depth preprocessor not available")
            control_image = midas_processor(image)
            pipe = await loop.run_in_executor(
                None,
                lambda: StableDiffusionControlNetPipeline.from_pretrained(
                    "runwayml/stable-diffusion-v1-5",
                    controlnet=controlnet_depth,
                    torch_dtype=torch.float16
                ).to(device)
            )
        else:
            raise ValueError(f"Unsupported preprocessor: {preprocessor}")
        print("Stable Diffusion pipeline loaded successfully")
    except Exception as e:
        print(f"Error loading Stable Diffusion pipeline: {str(e)}")
        traceback.print_exc()
        raise
    
    try:
        print("Generating control image...")
        if preprocessor == "canny":
            control_image = canny_processor(image)
        elif preprocessor == "pose":
            # Use easy_dwpose's DWposeDetector with additional parameters
            control_image = openpose_processor(image, output_type="pil", include_hands=True, include_face=True)
        elif preprocessor == "depth":
            control_image = midas_processor(image)
        else:
            raise ValueError(f"Unsupported preprocessor: {preprocessor}")
        
        print("Running inference...")
        log_gpu_memory()
        output = pipe(
            prompt,
            image=control_image,
            num_inference_steps=50
        ).images[0]
        
        # Ensure the generations directory exists
        os.makedirs("generations", exist_ok=True)
        output_path = os.path.join("generations", f"{uuid.uuid4()}.png")
        
        # Save the image with error handling
        try:
            output.save(output_path)
            # Verify the file exists
            if not os.path.exists(output_path):
                raise FileNotFoundError(f"Image file {output_path} was not created")
            print(f"Image generated and saved to: {output_path}")
        except Exception as e:
            print(f"Error saving image to {output_path}: {str(e)}")
            raise
        
        return output_path
    finally:
        print("Cleaning up pipeline and GPU memory...")
        del pipe
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()
        log_gpu_memory()

async def process_generation_task(task_data: str):
    """Process a generation task from the queue"""
    try:
        print(f"Received task: {task_data}")
        data = json.loads(task_data)
        generation_id = data["id"]
        prompt = data["prompt"]
        preprocessor = data["preprocessor"]
        image_path = data["image_path"]
        print(f"Processing task ID: {generation_id}, Image: {image_path}, Preprocessor: {preprocessor}")
        
        # Validate preprocessor
        supported_preprocessors = ["canny", "pose", "depth"]
        if preprocessor not in supported_preprocessors:
            error_msg = f"Unsupported preprocessor: {preprocessor}. Supported preprocessors: {supported_preprocessors}"
            print(error_msg)
            async with async_session() as session:
                await session.execute(
                    text("""
                    UPDATE generations 
                    SET status = 'error', error_message = :error 
                    WHERE id = :id
                    """),
                    {"id": generation_id, "error": error_msg}
                )
                await session.commit()
            return
        
        async with async_session() as session:
            result = await session.execute(
                text("SELECT * FROM generations WHERE id = :id"),
                {"id": generation_id}
            )
            generation = result.fetchone()
            if not generation:
                print(f"Generation {generation_id} not found in database")
                return
        
        async with async_session() as session:
            await session.execute(
                text("UPDATE generations SET status = 'processing' WHERE id = :id"),
                {"id": generation_id}
            )
            await session.commit()
            print(f"Status updated to 'processing' for generation {generation_id}")
        
        output_path = await process_image(image_path, prompt, preprocessor)
        
        async with async_session() as session:
            await session.execute(
                text("""
                UPDATE generations 
                SET status = 'completed', output_image_path = :output_path 
                WHERE id = :id
                """),
                {"id": generation_id, "output_path": output_path}
            )
            await session.commit()
            print(f"Generation {generation_id} completed successfully")
            
    except Exception as e:
        print(f"Error processing generation {data.get('id', 'unknown')}: {str(e)}")
        traceback.print_exc()
        async with async_session() as session:
            await session.execute(
                text("""
                UPDATE generations 
                SET status = 'error', error_message = :error 
                WHERE id = :id
                """),
                {"id": generation_id, "error": str(e)}
            )
            await session.commit()

async def consume_queue():
    """Consume messages from the RabbitMQ queue"""
    retry_count = 0
    max_retries = 5
    
    while retry_count < max_retries:
        try:
            print("Connecting to RabbitMQ...")
            connection = await aio_pika.connect_robust(
                "amqp://guest:guest@rabbitmq/?heartbeat=240",
                timeout=30
            )
            print("RabbitMQ connection established")
            
            channel = await connection.channel()
            print("RabbitMQ channel created")
            
            # Set prefetch count to 1 to process one message at a time
            await channel.set_qos(prefetch_count=1)
            
            queue = await channel.declare_queue(
                "sd_controlnet_tasks",
                durable=True
            )
            print("Queue declared: sd_controlnet_tasks")
            
            print("Worker started, waiting for messages...")
            retry_count = 0
            
            async def process_message(message):
                try:
                    async with message.process(requeue=True):
                        task_data = message.body.decode()
                        data = json.loads(task_data)
                        message_id = data["id"]
                        
                        # Check if the task has already been processed by querying the database
                        async with async_session() as session:
                            result = await session.execute(
                                text("SELECT status FROM generations WHERE id = :id"),
                                {"id": message_id}
                            )
                            generation = result.fetchone()
                            if generation and generation.status in ["completed", "error"]:
                                print(f"Skipping already processed message: {message_id} (status: {generation.status})")
                                return
                        
                        print(f"Consumed message: {task_data}")
                        await process_generation_task(task_data)
                        print(f"Task {task_data} processed successfully")
                except Exception as e:
                    print(f"Error in process_message: {str(e)}")
                    traceback.print_exc()
                    raise
            
            await queue.consume(process_message)
            print("Consumer registered successfully")
            return
            
        except Exception as e:
            retry_count += 1
            wait_time = min(30, 5 * retry_count)
            print(f"Connection error (attempt {retry_count}/{max_retries}): {str(e)}")
            traceback.print_exc()
            print(f"Retrying in {wait_time} seconds...")
            await asyncio.sleep(wait_time)
    
    print("Max retries reached. Exiting...")

async def test_db_connection():
    async with async_session() as session:
        try:
            result = await session.execute(text("SELECT 1"))
            print("Database connection test successful:", result.fetchone())
        except Exception as e:
            print(f"Database connection test failed: {str(e)}")
            raise

if __name__ == "__main__":
    try:
        os.makedirs("Uploads", exist_ok=True)
        os.makedirs("generations", exist_ok=True)
        print("Directories created successfully")
        
        # Create a single event loop for all async operations
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        # Initialize components and run the consumer
        loop.run_until_complete(initialize_components())
        loop.run_until_complete(test_db_connection())
        loop.run_until_complete(consume_queue())
        
        # Keep the loop running
        loop.run_forever()
        
    except Exception as e:
        print(f"Worker failed: {str(e)}")
        traceback.print_exc()
        raise
    finally:
        loop.close()