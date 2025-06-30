# Code Visualizer Backend

FastAPI backend for the Code Visualizer application that executes Python code and provides execution traces.

## Features

- Execute Python code safely with tracing
- Provide step-by-step execution visualization
- Track variable states and memory objects
- CORS enabled for frontend integration

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `GET /health` - Health status
- `POST /run` - Execute Python code and get trace

### Execute Code

```bash
curl -X POST "http://localhost:8000/run" \
     -H "Content-Type: application/json" \
     -d '{"code": "print(\"Hello, World!\")"}'
```

## Deployment Options

### Option 1: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Choose the `backend` folder as the root
6. Railway will automatically detect and deploy the FastAPI app

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Set:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option 3: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Deploy:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-app-name
   git push heroku main
   ```

## Environment Variables

- `PORT` - Server port (automatically set by deployment platforms)

## Dependencies

- FastAPI - Web framework
- Uvicorn - ASGI server
- Pydantic - Data validation 