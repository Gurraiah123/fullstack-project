pipeline {
    agent any

    environment {
        FRONTEND_DIR = "frontend"
        BACKEND_DIR = "backend"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh '''
                    rm -rf venv

                    python3 -m venv venv

                    ./venv/bin/pip install --upgrade pip

                    ./venv/bin/pip install -r requirements.txt
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh '''
                    npm install
                    npm run build
                    '''
                }
            }
        }

        stage('Start Backend') {
            steps {
                sh '''
                pkill -f "uvicorn" || true

                cd backend

                nohup ./venv/bin/uvicorn main:app \
                    --host 0.0.0.0 \
                    --port 8000 \
                    > backend.log 2>&1 &
                '''
            }
        }

        stage('Start Frontend') {
            steps {
                sh '''
                pkill -f "vite preview" || true

                cd frontend

                nohup npm run preview -- \
                    --host 0.0.0.0 \
                    --port 5173 \
                    > frontend.log 2>&1 &
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                sleep 10

                curl http://127.0.0.1:8000/

                curl http://127.0.0.1:5173/
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment Successful"
        }

        failure {
            echo "Deployment Failed"
        }
    }
}
