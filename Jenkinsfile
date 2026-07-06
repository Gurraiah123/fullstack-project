pipeline {
    agent { label 'build-agent' }

    environment {
        AWS_REGION = "us-east-1"
        EKS_CLUSTER = "education-cluster"

        FRONTEND_REPO = "fullstack-project-frontend"
        BACKEND_REPO  = "fullstack-project-backend"

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Verify Tools') {
            steps {
                sh '''
                docker --version
                aws --version
                kubectl version --client
                eksctl version
                java -version
                '''
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh '''
                    docker build -t ${BACKEND_REPO}:${IMAGE_TAG} .
                 stage('Build Backend Docker Image') {
    steps {
        sh '''
        docker build -t ${BACKEND_REPO}:${IMAGE_TAG} \
        -f backend/Dockerfile backend

        docker tag ${BACKEND_REPO}:${IMAGE_TAG} ${BACKEND_REPO}:latest
        '''
    }
}

stage('Build Frontend Docker Image') {
    steps {
        sh '''
        docker build -t ${FRONTEND_REPO}:${IMAGE_TAG} \
        -f frontend/Dockerfile frontend

        docker tag ${FRONTEND_REPO}:${IMAGE_TAG} ${FRONTEND_REPO}:latest
        '''
    }
}

        stage('List Docker Images') {
            steps {
                sh '''
                docker images
                '''
            }
        }

        stage('Configure kubectl') {
            steps {
                sh '''
                aws eks update-kubeconfig \
                --region ${AWS_REGION} \
                --name ${EKS_CLUSTER}
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                kubectl apply -f k8s/
                kubectl rollout status deployment/backend --timeout=300s
                kubectl rollout status deployment/frontend --timeout=300s
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                kubectl get nodes
                kubectl get pods
                kubectl get svc
                '''
            }
        }
    }

    post {
        always {
            sh 'docker image prune -af || true'
        }

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}
