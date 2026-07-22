pipeline {

    agent {
        label 'slave-1'
    }

    tools {
        nodejs 'Node22'
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
                        npm install
                    '''
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh '''
                        npm run build
                    '''
                }
            }
        }

        stage('Backend - Create Virtual Environment') {
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

                sshagent(credentials: ['ec2-key']) {

                    sh """
                        scp -o StrictHostKeyChecking=no app.zip ${DEPLOY_USER}@${DEPLOY_SERVER}:/tmp/
                    """
                }
            }
        }

        stage('Deploy Application') {

            steps {

                sshagent(credentials: ['ec2-key']) {

                    sh """
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVER} << EOF

                    sudo rm -rf ${DEPLOY_DIR}
                    mkdir -p ${DEPLOY_DIR}

                    unzip -o /tmp/app.zip -d /tmp/

                    cp -r /tmp/fullstack-project-main/* ${DEPLOY_DIR}/

                    cd ${DEPLOY_DIR}/backend

                    python3 -m venv venv

                    ./venv/bin/pip install --upgrade pip

                    ./venv/bin/pip install -r requirements.txt

                    sudo systemctl restart fastapi

                    sudo rm -rf /var/www/html/*

                    sudo cp -r ${DEPLOY_DIR}/frontend/dist/* /var/www/html/

                    sudo systemctl restart nginx

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

            echo "==========================================="
            echo "Application deployed successfully."
            echo "Frontend : http://${DEPLOY_SERVER}"
            echo "Backend  : http://${DEPLOY_SERVER}:8000"
            echo "==========================================="
        }

        failure {

            echo "==========================================="
            echo "Deployment Failed."
            echo "Check Jenkins Console Output."
            echo "==========================================="
        }
    }
}
