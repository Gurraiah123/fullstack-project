pipeline {

    agent {
        label 'slave-1'
    }

    environment {
        DEPLOY_USER   = "ubuntu"
        DEPLOY_SERVER = "54.252.74.150"
        DEPLOY_DIR    = "/home/ubuntu/fullstack-project"

        FRONTEND_DIR  = "frontend"
        BACKEND_DIR   = "backend"
    }

    stages {

        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Frontend - Install Dependencies') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh '''
                        export NVM_DIR="$HOME/.nvm"
                        [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                        node -v
                        npm -v

                        npm install
                    '''
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh '''
                        export NVM_DIR="$HOME/.nvm"
                        [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                        npm run build
                    '''
                }
            }
        }

        stage('Backend - Install Dependencies') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh '''
                        python3 -m venv venv

                        ./venv/bin/pip install --upgrade pip

                        ./venv/bin/pip install -r requirements.txt
                    '''
                }
            }
        }

        stage('Create Deployment Package') {
            steps {
                sh '''
                    rm -f app.zip

                    zip -r app.zip . \
                        -x "*.git*" \
                        -x "frontend/node_modules/*" \
                        -x "backend/venv/*"
                '''
            }
        }

        stage('Copy Package to EC2') {
            steps {
                sshagent(credentials: ['ubuntu-agent-key']) {
                    sh """
                        scp -o StrictHostKeyChecking=no app.zip ${DEPLOY_USER}@${DEPLOY_SERVER}:/tmp/
                    """
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sshagent(credentials: ['ubuntu-agent-key']) {

                    sh """
ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVER} << 'EOF'

set -e

echo "Cleaning old deployment..."

sudo rm -rf /home/ubuntu/fullstack-project
mkdir -p /home/ubuntu/fullstack-project

echo "Extracting package..."

rm -rf /tmp/backend /tmp/frontend /tmp/Jenkinsfile
unzip -o /tmp/app.zip -d /tmp

echo "Copying project..."

cp -r /tmp/backend /home/ubuntu/fullstack-project/
cp -r /tmp/frontend /home/ubuntu/fullstack-project/

echo "Installing backend..."

cd /home/ubuntu/fullstack-project/backend

python3 -m venv venv

./venv/bin/pip install --upgrade pip

./venv/bin/pip install -r requirements.txt

echo "Restarting FastAPI..."

sudo systemctl restart fastapi

echo "Deploying Frontend..."

sudo rm -rf /var/www/html/*

sudo cp -r /home/ubuntu/fullstack-project/frontend/dist/* /var/www/html/

echo "Restarting Nginx..."

sudo systemctl restart nginx

echo "Deployment completed successfully."

EOF
"""
                }
            }
        }

        stage('Health Check') {
            steps {
                sh """
                    curl -I http://${DEPLOY_SERVER} || true
                """
            }
        }
    }

    post {

        always {
            cleanWs()
        }

        success {
            echo "========================================"
            echo "Deployment Successful"
            echo "Frontend : http://${DEPLOY_SERVER}"
            echo "Backend  : http://${DEPLOY_SERVER}:8000"
            echo "========================================"
        }

        failure {
            echo "========================================"
            echo "Deployment Failed"
            echo "Check Jenkins Console Output"
            echo "========================================"
        }
    }
}
