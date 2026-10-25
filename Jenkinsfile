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
    }
}
