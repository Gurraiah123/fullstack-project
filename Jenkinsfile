pipeline {
    agent any

    environment {
        EC2_USER = "ubuntu"
        EC2_HOST = "34.206.52.251"
        KEY_PATH = "/var/lib/jenkins/keys/UbuntuKeypair.pem"

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

                # ❌ DO NOT use source (Jenkins sh does not support it)

                ./venv/bin/pip install --upgrade pip
                ./venv/bin/pip install -r requirements.txt
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
                

                echo "Deploying to EC2..."

                ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/keys/UbuntuKeypair.pem ubuntu@34.206.52.251 "
                    mkdir -p /home/ubuntu/fullstack-project/fullstack-project
                "

                rsync -avz -e "ssh -i /var/lib/jenkins/keys/UbuntuKeypair.pem -o StrictHostKeyChecking=no" \
                backend/ ubuntu@34.206.52.251:/home/ubuntu/fullstack-project/fullstack-project/backend

                rsync -avz -e "ssh -i /var/lib/jenkins/keys/UbuntuKeypair.pem -o StrictHostKeyChecking=no" \
                frontend/dist/ ubuntu@34.206.52.251:/home/ubuntu/fullstack-project/fullstack-project/frontend/dist
                '''
            }
        }

        stage('Restart Services') {
            steps {
                sh '''
                ssh -i /var/lib/jenkins/keys/UbuntuKeypair.pem ubuntu@34.206.52.251 << EOF

                sudo systemctl daemon-reload
                sudo systemctl restart fastapi || true
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
