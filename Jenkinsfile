pipeline {

    agent any

    environment {
        FRONTEND_DIR = "frontend"
        BACKEND_DIR  = "backend"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Check Tools') {
            steps {
                sh '''
                echo "Checking installed tools..."

                python3 --version
                pip3 --version

                node -v
                npm -v

                nginx -v

                git --version
                '''
            }
        }

        stage('Build Backend') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh '''
                    rm -rf venv

                    python3 -m venv venv

                    ./venv/bin/python -m pip install --upgrade pip

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
                sudo systemctl restart fastapi

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
                curl -I http://localhost

                curl http://127.0.0.1:8000/
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
