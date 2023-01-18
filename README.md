# Kubernetes

This repository servers as the single source of truth for [Argo CD](https://argo-cd.readthedocs.io/en/stable/).

## Repository structure
```yaml
apps/
├── _index                    # App of apps which tells Argo CD of all other apps inside of this repository
├── <app-name>
|   ├── templates/
|   |   └── *.yml             # Helm templates
|   ├── Chart.yaml
|   ├── values-<env>.yml      # Helm values for specific environment
|   └── secrets-<env>.yml     # Helm values protected with SOPS
keys/
    └── *.asc                 # Public keys of all consumers of the secrets
```

## Environments

- **Lab** - test environment used to develop the Helm charts and test apps running locally inside of HyperV on a developer's workstation (see the [platform](https://github.com/homecentr/platform) repo on how to create the environment).
- **Production** - the actual deployment used by the users.

## Development
1. Create Lab environment using the scripts in the [platform](https://github.com/homecentr/platform) repository
1. Run `yarn`
1. Run `yarn setup` (as administrator on Windows or with sudo on Linux) which will install all required tools
1. Set `EDITOR` environment variable to your desired editor (use `code --wait` for VS Code)
1. Make changes
1. Test changes using
    - `yarn lint` to lint the helm chart
    - `yarn render <env>` to render the chart templates for given environment
1. Push the changes to the `lab` branch to deploy them to the lab kubernetes cluster
1. Create pull request to the master branch to deploy them to production cluster

## Secrets
Files with sensitive values are protected using [SOPS](https://github.com/mozilla/sops). To create or edit a file using the following command:

```bash
sops <file-path>
```

This will open the configured editor, make required changes and close the tab, sops will encrypt the contents in place. Please note all files must use the `.<environment>.yml` suffix so that SOPS knows which keys to use to encrypt the files since each environment uses different encryption keys.
