import { labelSingleton } from "../props"

export const NetlifyDeploymentConfig = {
  name: 'NetlifyDeploymentConfig',
  type: 'object',
  title: 'Netlify build hook settings',
  fields: [
    {
      ...labelSingleton,
      description: 'A name for your deployment. This can be whatever you want, to help you organize your deployments. Typically, this should be the environment you are deploying to, like Production or Staging',
    },
    {
      name: 'projectName',
      title: 'Prosjekt navn',
      description: 'The Netlify site name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'apiId',
      title: 'API id',
      description: 'The Netfliy API ID of your site (see Site Settings > General > Site Details > Site Information -> API ID).',
      type: 'string'
    },
    {
      name: 'buildHook',
      title: 'Build hook url',
      description: 'The id of a build hook you have created for your site within the Netlify administration panel (see Site Settings > Build & Deploy > Continuous Deployment -> Build Hooks).',
      type: 'url',
      validation: Rule => Rule.required()
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
      projectName: 'projectName',
      deployHook: 'deployHook',
    },
    prepare(selection) {
      const { title, projectName, deployHook } = selection
      return {
        title: `${title ?? ''} ${projectName}`,
        subtitle: deployHook
      }
    },
  },
}
