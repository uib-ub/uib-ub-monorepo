import { labelSingleton } from "../props"

export const GitLabCIConfig = {
  name: 'GitLabCIConfig',
  type: 'object',
  title: 'GitLab CI settings',
  fields: [
    {
      ...labelSingleton,
      description: 'A name for your deployment. This can be whatever you want, to help you organize your deployments. Typically, this should be the environment you are deploying to, like Production or Staging',
      validation: Rule => Rule
    },
    {
      name: 'projectID',
      title: 'Prosjekt ID',
      description: 'The GitLab Project ID.',
      type: 'number',
      validation: Rule => Rule.required()
    },
    {
      name: 'buildHook',
      title: 'Build hook url',
      description: 'The id of a build hook you have created for your site within the Netlify administration panel (see Site Settings > Build & Deploy > Continuous Deployment -> Build Hooks).',
      type: 'url',
    },
    {
      name: 'useEnvironmentVariableName',
      title: 'Token navn',
      description: 'Token som skal brukes til å hente deployment informasjon. NB! Ikke lim inn the faktiske token!',
      type: 'string',
      validation: Rule => Rule.required()
    },
  ],
  preview: {
    select: {
      title: 'label',
      projectID: 'projectID',
      deployHook: 'deployHook',
    },
    prepare(selection) {
      const { title, projectID, deployHook } = selection
      return {
        title: `${title ?? ''} ProsjektID: ${projectID}`,
        subtitle: deployHook
      }
    },
  },
}
