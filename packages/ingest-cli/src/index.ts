// Load environment variables from .env file
import dotenv from 'dotenv';
// Configure dotenv at the beginning to ensure environment variables are available
dotenv.config();

import { Command } from 'commander';
import { ingestItems } from './utils/ingest-object/ingest-items';
import { ingestFilesets } from './utils/ingest-fileset/ingest-filesets';
import { fetchFileset } from './utils/ingest-fileset/fetch-fileset';
import { ingestWab } from './utils/ingest-wab/ingest-wab';
import { ingestSka } from './utils/ingest-ska/ingest-ska';
import { putTemplates } from './utils/tempates/es_templates';
import { ingestItem as ingestObject } from './utils/ingest-object/ingest-item';
import { version } from "../package.json";
import { ingestPeople } from './utils/ingest-person/ingest-people';
import { ingestPerson } from './utils/ingest-person/ingest-person';
import { ingestGroups } from './utils/ingest-group/ingest-groups';
import { ingestGroup } from './utils/ingest-group/ingest-group';
import { ingestSets } from './utils/ingest-set/ingest-sets';
import { ingestSet } from './utils/ingest-set/ingest-set';

const program = new Command();
program
  .name('chc-cli')
  .description('CLI for ingesting datasets and managing Elasticsearch templates')
  .version(version ?? '0.0.0');

// Dataset ingestion command
program
  .command('ingest')
  .description('Ingest a dataset into Elasticsearch')
  .argument('<dataset>', 'Dataset to ingest (items, filesets, wab, ska)')
  .option('-l, --limit <number>', 'Number of items to fetch per page', '100')
  .option('-p, --page <number>', 'Page number to start from', '0')
  .option('-o, --overwrite', 'Overwrite existing data', false)
  .action(async (dataset, options) => {
    const limit = parseInt(options.limit, 10);
    const page = parseInt(options.page, 10);
    const overwrite = options.overwrite;

    console.log(`Ingesting ${dataset} dataset with limit=${limit}, page=${page}, overwrite=${overwrite}`);

    try {
      switch (dataset) {
        case 'object':
          await ingestItems(limit, page, overwrite);
          break;
        case 'fileset':
          await ingestFilesets(limit, page, overwrite);
          break;
        case 'person':
          await ingestPeople(limit, page, overwrite);
          break;
        case 'group':
          await ingestGroups(limit, page, overwrite);
          break;
        case 'set':
          await ingestSets(limit, page, overwrite);
          break;
        case 'wab':
          await ingestWab();
          break;
        case 'ska':
          await ingestSka();
          break;
        default:
          console.error(`Unknown dataset: ${dataset}`);
          process.exit(1);
      }
    } catch (error) {
      console.error(`Error ingesting ${dataset}:`, error);
      process.exit(1);
    }
  });

// Single item ingestion command
program
  .command('ingest-object')
  .description('Ingest a single object by ID')
  .argument('<id>', 'ID of the object to ingest')
  .action(async (id) => {
    console.log(`Ingesting object with ID: ${id}`);

    try {
      await ingestObject(id);
      console.log(`Successfully ingested object with ID: ${id}`);
    } catch (error) {
      console.error(`Error ingesting object with ID ${id}:`, error);
      process.exit(1);
    }
  });

// Single fileset ingestion command
program
  .command('ingest-fileset')
  .description('Ingest a single fileset by ID')
  .argument('<id>', 'ID of the fileset to ingest')
  .action(async (id) => {
    console.log(`Ingesting fileset with ID: ${id}`);

    try {
      await fetchFileset(id);
      console.log(`Successfully ingested fileset with ID: ${id}`);
    } catch (error) {
      console.error(`Error ingesting fileset with ID ${id}:`, error);
      process.exit(1);
    }
  });

program
  .command('ingest-person')
  .description('Ingest a single person by ID')
  .argument('<id>', 'ID of the person to ingest')
  .action(async (id) => {
    console.log(`Ingesting person with ID: ${id}`);

    try {
      await ingestPerson(id);
      console.log(`Successfully ingested person with ID: ${id}`);
    } catch (error) {
      console.error(`Error ingesting person with ID ${id}:`, error);
      process.exit(1);
    }
  });

program
  .command('ingest-group')
  .description('Ingest a single group by ID')
  .argument('<id>', 'ID of the group to ingest')
  .action(async (id) => {
    console.log(`Ingesting group with ID: ${id}`);

    try {
      await ingestGroup(id);
      console.log(`Successfully ingested group with ID: ${id}`);
    } catch (error) {
      console.error(`Error ingesting group with ID ${id}:`, error);
      process.exit(1);
    }
  });

program
  .command('ingest-set')
  .description('Ingest a single set by ID')
  .argument('<id>', 'ID of the set to ingest')
  .action(async (id) => {
    console.log(`Ingesting set with ID: ${id}`);

    try {
      await ingestSet(id);
      console.log(`Successfully ingested set with ID: ${id}`);
    } catch (error) {
      console.error(`Error ingesting set with ID ${id}:`, error);
      process.exit(1);
    }
  });

// Templates command
program
  .command('templates')
  .description('Manage Elasticsearch templates')
  .option('-a, --action <action>', 'Action to perform (put, get, delete)', 'put')
  .action(async (options) => {
    try {
      switch (options.action) {
        case 'put':
          console.log('Setting up Elasticsearch templates...');
          const result = await putTemplates();
          console.log('Templates setup result:', result);
          break;
        case 'get':
          console.log('Getting Elasticsearch templates...');
          // Implement get templates functionality
          break;
        case 'delete':
          console.log('Deleting Elasticsearch templates...');
          // Implement delete templates functionality
          break;
        default:
          console.error(`Unknown action: ${options.action}`);
          process.exit(1);
      }
    } catch (error) {
      console.error('Error managing templates:', error);
      process.exit(1);
    }
  });

program.parse(process.argv); 