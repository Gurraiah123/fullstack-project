pipeline {
 
    agent {
        label 'slave-1'
    }
 
    options {
        timestamps()
        ansiColor('xterm')
    }
 
    environment {
 
        GIT_BRANCH = "main"
 
        FRONTEND = "frontend"
        BACKEND = "backend"
 
        SONAR_URL = "http://54.176.16.177:9000"
 
        NEXUS_URL = "http://54.176.16.177:8081"
        NEXUS_REPO = "full-stack"
 
        APP_NAME = "fullstack-project"
 
        DEPLOY_USER = "ubuntu"
        DEPLOY_HOST = "54.176.16.177"
        DEPLOY_DIR = "/home/ubuntu/fullstack-project"
 
        DOCKERHUB_USERNAME = "guru0114"
 
        FRONTEND_IMAGE = "guru0114/frontend"
        BACKEND_IMAGE  = "guru0114/backend"
 
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
 
    stages {
 
        stage('Checkout') {
 
            steps {
                checkout scm
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
 
                withSonarQubeEnv('SonarQube') {
 
                    sh '''
 
                    sonar-scanner \
                    -Dsonar.projectKey=fullstack-project \
                    -Dsonar.projectName=fullstack-project \
                    -Dsonar.sources=. \
                    -Dsonar.sourceEncoding=UTF-8
 
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
 
        stage('Docker Login') {
 
            steps {
 
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
 
                    sh '''
 
                    echo "$DOCKER_PASS" | docker login \
                    -u "$DOCKER_USER" \
                    --password-stdin
 
                    '''
 
                }
 
            }
 
        }
