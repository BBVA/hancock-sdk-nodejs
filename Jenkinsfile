def lint() {
  stage('Linter'){
    container('node'){
      sh """
        yarn run lint
      """
    }
  }
}

nodePipeline{

  stage("Build Package"){
    container("node"){
      sh """
        npm install
        npm run build:prod
      """
    }
  }

  lint()

  stage("Unit Tests"){
    container("node"){
      sh "npm run coverage"
    }
  }

  stage("Docs"){
    container("node"){
      sh "npm run docs"
      upload_doc_shuttle_stage(docName: "hancock-sdk-client-javascript", docPath: "./typedocs")
    }
  }
  
  // TODO: Do a generic publish_npm_package stage in shuttle
  stage("Publish Package"){
    input "Publish package?"
    
    container("node"){
      withCredentials([string(credentialsId: 'NPM_REGISTRY', variable: 'NPM_REGISTRY'),string(credentialsId: 'NPM_REGISTRY_TOKEN', variable: 'NPM_REGISTRY_TOKEN')]){
        sh """
          echo "registry=http://${env.NPM_REGISTRY}/" >> .npmrc
          echo "//${env.NPM_REGISTRY}/:_authToken=\"${env.NPM_REGISTRY_TOKEN}\"" >> .npmrc
          cat .npmrc
          npm publish
          npm view
        """
      }
    }
  }

}
