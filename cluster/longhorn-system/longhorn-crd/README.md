# Updating CRDs

The CRDs are normally installed by the chart but to ensure safety they are installed using a kubernetes manifest to avoid data loss. The CRDs can be updated by rendering the helm chart locally using the command below. Please note that the CRDs are environment agnostic, the value files must be included to allow helm to internally render all templates in the chart.

```
helm template . -f values.yaml -f values.lab.yaml -f ../../../globals/values.lab.yaml --include-crds --show-only charts/longhorn/templates/crds.yaml > ../longhorn-crd/crds.yaml 
```