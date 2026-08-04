pipeline {

    agent {
        label 'slave-1'
    }

     environment {
        APP_NAME = "fullstack-project"
        GIT_BRANCH = "main"

        FRONTEND = "frontend"
        BACKEND = "backend"

        NEXUS_URL = "54.176.16.177:8082"
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
                git(
                    branch: "${GIT_BRANCH}",
                    url: "https://github.com/Gurraiah123/fullstack-project.git"
                )
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

                withCredentials([
                    string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')
                ]) {

                    sh '''
                    docker run --rm \
                      -e SONAR_HOST_URL=http://54.176.16.177:9000 \
                      -e SONAR-TOKEN=$SONAR-TOKEN \
                      -v "$PWD:/usr/src" \
                      sonarsource/sonar-scanner-cli:latest \
                      -Dsonar.projectKey=fullstack-project \
                      -Dsonar.projectName=fullstack-project \
                      -Dsonar.sources=/usr/src
                    '''
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

        stage('Push Docker Images') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'nexus-creds',
                        usernameVariable: 'USERNAME',
                        passwordVariable: 'PASSWORD'
                    )
                ]) {

                    sh '''
                    echo "$PASSWORD" | docker login ${NEXUS_URL} -u "$USERNAME" --password-stdin

                    docker tag frontend:latest ${NEXUS_URL}/${NEXUS_REPO}/frontend:latest
                    docker tag backend:latest ${NEXUS_URL}/${NEXUS_REPO}/backend:latest

                    docker push ${NEXUS_URL}/${NEXUS_REPO}/frontend:latest
                    docker push ${NEXUS_URL}/${NEXUS_REPO}/backend:latest
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
                        docker compose up -d
                        docker image prune -f
                    '
                    """
                }
            }
        }

    }

    post {

        success {
            echo 'Pipeline Completed Successfully'
        }

        failure {
            echo 'Pipeline Failed'
        }

        always {
            cleanWs()
        }
    }
}
