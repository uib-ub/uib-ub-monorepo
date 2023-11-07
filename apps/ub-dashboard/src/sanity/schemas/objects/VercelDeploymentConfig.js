import { labelSingleton } from "../props"

export const VercelDeploymentConfig = {
  name: 'VercelDeploymentConfig',
  type: 'object',
  title: 'Vercel deploy hook settings',
  fields: [
    {
      ...labelSingleton,
      description: 'A name for your deployment. This can be whatever you want, to help you organize your deployments. Typically, this should be the environment you are deploying to, like Production or Staging',
    },
    {
      name: 'projectName',
      title: 'Prosjekt navn',
      description: 'This is the actual Project Name listed in your Vercel account. Navigate to your Project Settings within Vercel to find your Project Name.',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'teamSlug',
      title: 'Team slug',
      description: 'If your project is part of a Vercel Team you will need to fill out this field. Navigate to your Team from within Vercel, and use the URL slug (ie. vercel.com/team-666).',
      type: 'string'
    },
    {
      name: 'deployHook',
      title: 'Deploy hook url',
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
