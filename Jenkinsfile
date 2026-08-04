pipeline {

    agent {
        label 'slave-1'
    }
    environment {

        APP_NAME = "fullstack-project"

        GIT_BRANCH = "main"

        FRONTEND = "frontend"
        BACKEND = "backend"

        SONAR_URL = "http://54.176.16.177:9000"

        NEXUS_URL = "http://54.176.16.177:8081"
        NEXUS_REPO = "full-stack"

        DEPLOY_USER = "ubuntu"
        DEPLOY_HOST = "YOUR_EC2_PUBLIC_IP"

        SSH_CREDENTIAL = "ec2-ssh"

    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                git branch: "${GIT_BRANCH}",
                url: 'https://github.com/Gurraiah123/fullstack-project.git'
            }
        }

        stage('Frontend Install') {
            steps {
                dir("${FRONTEND}") {
                    sh '''
                    npm install
                    '''
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir("${FRONTEND}") {
                    sh '''
                    npm run build
                    '''
                }
            }
        }

        stage('Backend Install') {
            steps {
                dir("${BACKEND}") {
                    sh '''
                    python3 -m venv venv

                    . venv/bin/activate

                    pip install --upgrade pip

                    pip install -r requirements.txt
                    '''
                }
            }
        }

        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv('sonarqube') {

                    sh '''
                    sonar-scanner \
                    -Dsonar.projectKey=fullstack-project \
                    -Dsonar.projectName=fullstack-project \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=$SONAR_URL \
                    -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {

                sh '''
                docker compose build
                '''

            }
        }

        stage('Push Docker Images to Nexus') {
            steps {

                withCredentials([usernamePassword(
                    credentialsId: 'nexus-creds',
                    usernameVariable: 'USERNAME',
                    passwordVariable: 'PASSWORD'
                )]) {

                    sh '''
                    echo "$PASSWORD" | docker login 54.176.16.177:8082 -u "$USERNAME" --password-stdin

                    docker tag frontend:latest 54.176.16.177:8082/full-stack/frontend:latest

                    docker tag backend:latest 54.176.16.177:8082/full-stack/backend:latest

                    docker push 54.176.16.177:8082/full-stack/frontend:latest

                    docker push 54.176.16.177:8082/full-stack/backend:latest
                    '''

                }

            }
        }

        stage('Deploy to EC2') {

            steps {

                sshagent(credentials: ["${SSH_CREDENTIAL}"]) {

                    sh """

                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} '

                    cd /home/ubuntu/${APP_NAME}

                    git pull

                    docker compose down

                    docker compose pull

                    docker compose up -d --build

                    docker image prune -f

                    '

                    """

                }

            }

        }

    }

    post {

        success {

            echo "Pipeline Completed Successfully"

        }

        failure {

            echo "Pipeline Failed"

        }

        always {

            cleanWs()

        }

    }

}
