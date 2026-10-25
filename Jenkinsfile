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
                        --build-arg VITE_BACKEND_ORIGIN=http://localhost:8080 \
                        -t "admin-frontend:ci-${BUILD_NUMBER}" .
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    export FRONTEND_IMAGE="admin-frontend:ci-${BUILD_NUMBER}"
                    docker image inspect "$FRONTEND_IMAGE" > /dev/null
                    docker compose -f compose.yaml config --quiet
                    docker compose -f compose.yaml up -d \
                        --no-build --pull never \
                        --wait --wait-timeout 60 frontend
                    docker compose -f compose.yaml ps frontend
                '''
            }
        }
    }
}
