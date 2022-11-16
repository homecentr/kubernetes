# Kubernetes infrastructure

The repository should contain all objects which are deployed to Kubernetes cluster. This allows easy and safe testing of changes in a non-production cluster.

## Release process
- Create a feature branch and push it to GitHub
- Create a Lab environment using the [platform](https://github.com/homecentr/platform) repository and set fluxcd branch to the name of the branch you created in this repository
- Push and test your changes in Lab environment
- Merge changes to master via Pull request which will run basic validations
- When merged to master the changes will be automatically applied to production cluster