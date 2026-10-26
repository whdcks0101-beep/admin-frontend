pipeline {
    agent {
        label 'admin-api-build'
    }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Lint and Test') {
            steps {
                sh 'docker build --target verify --progress=plain .'
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build --progress=plain \
                        --build-arg VITE_BACKEND_ORIGIN= \
                        -t "admin-frontend:aws-${BUILD_NUMBER}-$(git rev-parse --short=12 HEAD)" .
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    file(credentialsId: 'lightsail-ssh-key', variable: 'LIGHTSAIL_SSH_KEY')
                ]) {
                    sh '''
                        set +x
                        IMAGE="admin-frontend:aws-${BUILD_NUMBER}-$(git rev-parse --short=12 HEAD)"
                        bash deploy/lightsail/jenkins-deploy.sh frontend "$IMAGE"
                    '''
                }
            }
        }
    }
}
