nodePipeline{

  stage("Unit Tests"){
    container("node"){
      sh "node --version"
    }
  }

  stage("Build Package"){
    container("node"){
      sh """
        npm install
        npm run build:prod
      """
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
