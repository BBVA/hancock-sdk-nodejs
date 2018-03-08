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
      sh """
        npm publish
        npm view
      """
    }
  }

}
