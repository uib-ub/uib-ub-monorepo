import { Hono } from 'hono';
import contexts from '../../libs/jsonld-contexts/';

/**
 * These routes serves static files.
 */
const route = new Hono();

route.get('/es/context.json', async (c) => {
  return c.json(contexts.esMappingContext)
});

route.get('/ubbont/context.json', async (c) => {
  console.info('ubbontContext was requested')
  c.header('Content-Type', 'application/ld+json')
  c.header('Content-Disposition', 'inline; filename="context.json"')
  c.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  return c.body(JSON.stringify(contexts.ubbontContext, null, 2))
});

route.get('/shacl/context.json', async (c) => {
  c.header('Content-Type', 'application/ld+json')
  return c.body(JSON.stringify(contexts.shaclContext, null, 2))
});

route.get('/es/context.json', async (c) => {
  c.header('Content-Type', 'application/ld+json')
  return c.body(JSON.stringify(contexts.esMappingContext, null, 2))
});

export default route;