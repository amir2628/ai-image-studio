# AI Image Studio 🎨

**AI Image Studio** is a web application that leverages Stable Diffusion with ControlNet to generate images based on user-uploaded images and prompts. The project combines a **FastAPI** backend with a **React** frontend, orchestrated using **Docker** and **RabbitMQ** for asynchronous task processing. It supports multiple preprocessors (Canny Edge, Pose, and Depth) to guide image generation.

![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi) ![React](https://img.shields.io/badge/React-18-blue?logo=react) ![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker) ![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.13-orange?logo=rabbitmq)

<img width="1232" alt="Image" src="https://github.com/user-attachments/assets/45ea4bf4-7181-44c5-9a06-d1f8f3cfe574" />

## 🚀 Features

- **Image Generation**: Generate images using Stable Diffusion with ControlNet models (Canny, Pose, Depth).
- **Asynchronous Processing**: Tasks are queued and processed using RabbitMQ for efficient handling.
- **Database Integration**: PostgreSQL stores generation metadata with SQLAlchemy ORM.
- **Modern Frontend**: Built with React, featuring a responsive UI with Tailwind CSS styling.
- **Dockerized Backend**: Run the entire backend (API, worker, database, RabbitMQ) with Docker Compose.
- **Real-time Status Updates**: Poll generation status and display results dynamically.
- **Generation History**: View past generations with details like prompts and preprocessors.

## 🛠️ Tech Stack

- **Backend**: FastAPI, Python 3.10, SQLAlchemy, asyncpg, aio-pika
- **Frontend**: React, TypeScript, react-query, zustand, Tailwind CSS
- **Queue**: RabbitMQ for task queuing
- **Database**: PostgreSQL for persistent storage
- **Containerization**: Docker with NVIDIA CUDA support for GPU acceleration
- **AI/ML**: Stable Diffusion, ControlNet (Canny, OpenPose, Depth), easy_dwpose, PyTorch

## 📋 Prerequisites

Ensure you have the following installed:

- 🐳 [Docker](https://www.docker.com/get-started) (for backend)
- 🐳 [Docker Compose](https://docs.docker.com/compose/install/)
- 🟢 [Node.js](https://nodejs.org/) (v18 or later, for frontend)
- 🟢 [npm](https://www.npmjs.com/) (for frontend)
- 🖥️ NVIDIA GPU with CUDA support (optional, for faster image generation)

## ⚙️ Installation and Setup

### Backend (via Docker)

1. **Clone the Repository**

   ```bash
   git clone https://github.com/amir2628/ai-image-studio.git
   cd ai-image-studio
   ```

2. **Set Up Environment**

   Ensure you have a `requirements.txt` file with all dependencies listed. The `Dockerfile` handles installing these dependencies.

3. **Run Docker Compose**

   Start the backend services (FastAPI, RabbitMQ, PostgreSQL, and worker) using Docker Compose:

   ```bash
   docker-compose up -d --build
   ```

   This will:
   - Build the FastAPI and worker images.
   - Start PostgreSQL (`postgres:15`).
   - Start RabbitMQ (`rabbitmq:3-management`).
   - Run the FastAPI server on `http://localhost:8000`.
   - Run the worker for processing image generation tasks.

4. **Verify Services**

   - FastAPI: Visit `http://localhost:8000/docs` for the API documentation.
   - RabbitMQ Management: Access `http://localhost:15672` (default credentials: `guest/guest`).
   - PostgreSQL: Connect to `localhost:5432` with `postgres/postgres` credentials.

5. **Stop Services**

   ```bash
   docker-compose down
   ```

### Frontend (via npm)

1. **Navigate to the Frontend Directory**

   Ensure you are in the directory containing the React frontend (where `package.json` is located).

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run the Development Server**

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`.

## 📖 Usage

1. **Open the Application**

   - Access the frontend at `http://localhost:5173`.
   - The backend API is available at `http://localhost:8000`.

2. **Generate an Image**

   - Upload an image using the drag-and-drop interface.
   - Select a preprocessor (Canny, Pose, or Depth).
   - Enter a prompt describing the desired output.
   - Click "Generate Image" to queue the task.

3. **Monitor Progress**

   - The frontend polls the backend for generation status.
   - View the result once the status changes to "completed" or check for errors.

4. **View History**

   - Navigate to the "History" page via the sidebar to see past generations.
   - Each entry includes the prompt, preprocessor, status, and result (if completed).

## 📸 Results

<img width="1094" alt="Image" src="https://github.com/user-attachments/assets/9e54dd13-529a-4e94-90ca-97e177d74d05" />

## 🐳 Docker Architecture

The backend is orchestrated using Docker Compose with the following services:

- **postgres**: PostgreSQL database for storing generation metadata.
- **rabbitmq**: RabbitMQ for task queuing and management.
- **api**: FastAPI server handling HTTP requests and task queuing.
- **worker**: Background worker processing image generation tasks with GPU support.

The `Dockerfile` uses `nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04` as the base image, ensuring GPU compatibility for Stable Diffusion tasks.

## 🔧 Configuration

- **Backend**:
  - Database URL: `postgresql+asyncpg://postgres:postgres@postgres/sd_controlnet`
  - RabbitMQ: `amqp://guest:guest@rabbitmq/`
  - API Port: `8000`
  - Static File Mounts: `/uploads` and `/generations`

- **Frontend**:
  - API Base URL: `http://localhost:8000`
  - CORS: Configured to allow `http://localhost:5173`

## 🐛 Troubleshooting

- **Docker Issues**:
  - Ensure Docker and Docker Compose are installed and running.
  - Check container logs: `docker-compose logs`.
  - Verify NVIDIA GPU drivers if using CUDA.

- **Backend Errors**:
  - Check RabbitMQ connection: Ensure `rabbitmq` service is healthy (`http://localhost:15672`).
  - Verify PostgreSQL is running: Use `pg_isready -U postgres -h localhost`.

- **Frontend Errors**:
  - Ensure the backend API is running before starting the frontend.
  - Check browser console for CORS or network errors.

- **GPU Memory**:
  - Monitor GPU memory usage in `worker.py` logs.
  - Adjust `deploy.resources.limits.memory` in `docker-compose.yml` if needed.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## 📬 Contact

For questions or feedback, reach out to [Amir](https://github.com/amir2628) or open an issue on GitHub.

---

⭐ If you find this project useful, please give it a star on GitHub!