pipeline {
    agent any

    environment {
        EC2_USER = "ubuntu"
        EC2_HOST = "34.206.52.251"
        KEY_PATH = "/var/lib/jenkins/keys/your-key.pem"

        PROJECT_DIR = "/home/ubuntu/fullstack-project/fullstack-project"
        BACKEND_DIR = "/home/ubuntu/fullstack-project/fullstack-project/backend"
        FRONTEND_DIR = "/home/ubuntu/fullstack-project/fullstack-project/frontend"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/YOUR_USERNAME/YOUR_REPO.git'
            }
        }

        stage('Build Backend (Test Only)') {
            steps {
                sh '''
                cd backend
                python3 -m venv venv
                source venv/bin/activate
                pip install --upgrade pip
                pip install -r requirements.txt
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                cd frontend
                npm install
                npm run build
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                sh '''
                chmod 600 $KEY_PATH

                echo "Creating directories on EC2..."
                ssh -o StrictHostKeyChecking=no -i $KEY_PATH $EC2_USER@$EC2_HOST "
                    mkdir -p $PROJECT_DIR
                "

                echo "Copying backend..."
                rsync -avz -e "ssh -i $KEY_PATH -o StrictHostKeyChecking=no" backend/ $EC2_USER@$EC2_HOST:$BACKEND_DIR

                echo "Copying frontend build..."
                rsync -avz -e "ssh -i $KEY_PATH -o StrictHostKeyChecking=no" frontend/dist/ $EC2_USER@$EC2_HOST:$FRONTEND_DIR/dist
                '''
            }
        }

        stage('Restart Services on EC2') {
            steps {
                sh '''
                ssh -i $KEY_PATH -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST << 'EOF'

                echo "Restarting FastAPI..."

                sudo systemctl daemon-reload
                sudo systemctl restart fastapi || true

                echo "Restarting Nginx..."
                sudo systemctl restart nginx

                EOF
                '''
            }
        }
    }

    post {
        success {
            echo "🚀 Deployment Successful"
        }
        failure {
            echo "❌ Deployment Failed"
        }
    }
}
