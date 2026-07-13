pipeline {
    agent any
 
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
 
                rm -rf venv
                python3 -m venv venv
 
                ./venv/bin/python -m pip install --upgrade pip
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
 
        stage('Deploy Frontend') {
            steps {
                sh '''
                sudo rm -rf /var/www/html/*
                sudo cp -r frontend/dist/* /var/www/html/
                '''
            }
        }
 
        stage('Restart Backend') {
            steps {
                sh '''
                sudo pkill -f uvicorn || true
                sleep 5
 
                sudo systemctl daemon-reload
                sudo systemctl restart fastapi
 
                sleep 5
                sudo systemctl status fastapi --no-pager
                '''
            }
        }
 
        stage('Restart Nginx') {
            steps {
                sh '''
                sudo systemctl restart nginx
                sudo systemctl status nginx --no-pager
                '''
            }
        }
 
        stage('Health Check') {
            steps {
                sh '''
                curl -I http://localhost || true
                curl http://localhost:8000/ || true
                '''
            }
        }
    }
 
    post {
        success {
            echo 'Deployment Successful'
        }
 
        failure {
            echo 'Deployment Failed'
        }
    }
}
