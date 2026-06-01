pipeline {
    agent any

    environment {
        EC2_HOST = "34.206.52.251"
        EC2_USER = "ubuntu"
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

        stage('Deploy to EC2 (FIXED SSH)') {
            steps {
                sshagent(['ec2-key']) {
                    sh """
                    echo "Deploying to EC2..."

                    ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST '
                        mkdir -p /home/ubuntu/fullstack-project/fullstack-project
                    '

                    rsync -avz -e "ssh -o StrictHostKeyChecking=no" backend/ \
                    $EC2_USER@$EC2_HOST:/home/ubuntu/fullstack-project/fullstack-project/backend

                    rsync -avz -e "ssh -o StrictHostKeyChecking=no" frontend/dist/ \
                    $EC2_USER@$EC2_HOST:/home/ubuntu/fullstack-project/fullstack-project/frontend/dist
                    """
                }
            }
        }

        stage('Restart Services') {
            steps {
                sshagent(['ec2-key']) {
                    sh """
                    ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST << 'EOF'

                    sudo systemctl daemon-reload
                    sudo systemctl restart fastapi || true
                    sudo systemctl restart nginx

                    EOF
                    """
                }
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
