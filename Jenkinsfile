pipeline {
    agent any

    environment {
        EC2_USER = "ubuntu"
        EC2_HOST = "34.206.52.251"
        KEY_PATH = "/var/lib/jenkins/keys/UbuntuKeypair.pem"

        PROJECT_DIR = "/home/ubuntu/fullstack-project/fullstack-project"
        BACKEND_DIR = "/home/ubuntu/fullstack-project/fullstack-project/backend"
        FRONTEND_DIR = "/home/ubuntu/fullstack-project/fullstack-project/frontend"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Premchand-96/fullstack-project.git'
            }
        }

        stage('Build Backend') {
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
                chmod 400 /var/lib/jenkins/keys/UbuntuKeypair.pem

                echo "Connecting to EC2: ubuntu@34.206.52.251"

                ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/keys/UbuntuKeypair.pem ubuntu@34.206.52.251 "
                    mkdir -p /home/ubuntu/fullstack-project/fullstack-project
                "

                echo "Copying backend..."
                rsync -avz -e "ssh -i /var/lib/jenkins/keys/UbuntuKeypair.pem -o StrictHostKeyChecking=no" \
                backend/ ubuntu@34.206.52.251:/home/ubuntu/fullstack-project/fullstack-project/backend

                echo "Copying frontend build..."
                rsync -avz -e "ssh -i /var/lib/jenkins/keys/UbuntuKeypair.pem -o StrictHostKeyChecking=no" \
                frontend/dist/ ubuntu@34.206.52.251:/home/ubuntu/fullstack-project/fullstack-project/frontend/dist
                '''
            }
        }

        stage('Restart Services on EC2') {
            steps {
                sh '''
                ssh -i /var/lib/jenkins/keys/UbuntuKeypair.pem -o StrictHostKeyChecking=no ubuntu@34.206.52.251 << 'EOF'

                echo "Restarting FastAPI..."
                sudo systemctl daemon-reload
                sudo systemctl restart fastapi || echo "FastAPI restart failed"

                echo "Restarting Nginx..."
                sudo systemctl restart nginx

                EOF
                '''
            }
        }
    }

    post {
        success {
            echo "🚀 Deployment Successful on EC2 (34.206.52.251)"
        }
        failure {
            echo "❌ Deployment Failed"
        }
    }
}
