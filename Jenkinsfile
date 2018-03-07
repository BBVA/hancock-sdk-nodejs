nodePipeline{

  stage("Unit Tests"){
    container("node"){
      sh "node --version"
    }
  }
  
  // TODO: Do a generic publish_npm_package stage in shuttle
  stage("Publish Package"){
    input "Publish package?"
    
    container("node"){
      sh "npm publish"
      sh "npm view"
    }
  }

}
