
pipeline {
    agent { label 'build-agent' }

    environment {
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = '211856249789'

        FRONTEND_REPO = 'fullstack-project-frontend'
        BACKEND_REPO  = 'fullstack-project-backend'

        EKS_CLUSTER = 'education-cluster'

        FRONTEND_IMAGE = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${FRONTEND_REPO}"
        BACKEND_IMAGE  = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${BACKEND_REPO}"

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Premchand-96/fullstack-project.git'
            }
        }

        stage('Verify Tools') {
            steps {
                sh '''
                docker --version
                aws --version
                kubectl version --client
                eksctl version
                java -version
                node -v
                npm -v
                '''
            }
        }

        stage('AWS Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-creds',
                        usernameVariable: 'AKIATCU452O6SE7R2GQC',
                        passwordVariable: 'lkiJ4RdOT3l0WXTju4ZK0k6+3uij74ZOaqSrAJVc'
                    )
                ]) {

                    sh '''
                    aws configure set aws_access_key_id $AKIATCU452O6SE7R2GQC
                    aws configure set aws_secret_access_key $lkiJ4RdOT3l0WXTju4ZK0k6+3uij74ZOaqSrAJVc
                    aws configure set default.region ${us-east-1}

                    aws ecr get-login-password --region ${us-east-1} | \
                    docker login --username AWS --password-stdin \
                    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    '''
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh '''
                    docker build -t ${BACKEND_REPO}:${IMAGE_TAG} .
                    docker tag ${BACKEND_REPO}:${IMAGE_TAG} ${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker tag ${BACKEND_REPO}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                    '''
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh '''
                    docker build -t ${FRONTEND_REPO}:${IMAGE_TAG} .
                    docker tag ${FRONTEND_REPO}:${IMAGE_TAG} ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker tag ${FRONTEND_REPO}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                    '''
                }
            }
        }

        stage('Push Backend Image') {
            steps {
                sh '''
                docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                docker push ${BACKEND_IMAGE}:latest
                '''
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                docker push ${FRONTEND_IMAGE}:latest
                '''
            }
        }

        stage('Configure kubectl') {
            steps {
                sh '''
                aws eks update-kubeconfig \
                --region ${us-east-1} \
                --name ${EKS_CLUSTER}
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                kubectl apply -f k8s/

                kubectl set image deployment/backend \
                backend=${BACKEND_IMAGE}:${IMAGE_TAG}

                kubectl set image deployment/frontend \
                frontend=${FRONTEND_IMAGE}:${IMAGE_TAG}

                kubectl rollout status deployment/backend
                kubectl rollout status deployment/frontend
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                kubectl get nodes
                kubectl get pods -A
                kubectl get svc -A
                '''
            }
        }
    }

    post {

        always {
            sh '''
            docker image prune -f
            '''
        }

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}
