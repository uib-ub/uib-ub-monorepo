// Load environment variables from .env file
import dotenv from 'dotenv';
// Configure dotenv at the beginning to ensure environment variables are available
dotenv.config();

import { Command } from 'commander';
import { ingestItems } from './utils/ingest-items/ingest-items';
import { ingestFilesets } from './utils/ingest-filesets/ingest-filesets';
import { ingestWab } from './utils/ingest-wab/ingest-wab';
import { ingestSka } from './utils/ingest-ska/ingest-ska';
import { putTemplates } from './utils/tempates/es_templates';
import { ingestItem } from './utils/ingest-items/ingest-item';
import { version } from "../package.json";
import { ingestPeople } from './utils/ingest-people/ingest-people';
import { ingestPerson } from './utils/ingest-people/ingest-person';
import { ingestGroups } from './utils/ingest-groups/ingest-groups';
import { ingestGroup } from './utils/ingest-groups/ingest-group';

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
        case 'items':
          await ingestItems(limit, page, overwrite);
          break;
        case 'filesets':
          await ingestFilesets(limit, page, overwrite);
          break;
        case 'people':
          await ingestPeople(limit, page, overwrite);
          break;
        case 'groups':
          await ingestGroups(limit, page, overwrite);
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
  .command('ingest-item')
  .description('Ingest a single item by ID')
  .argument('<id>', 'ID of the item to ingest')
  .action(async (id) => {
    console.log(`Ingesting item with ID: ${id}`);

    try {
      await ingestItem(id);
      console.log(`Successfully ingested item with ID: ${id}`);
    } catch (error) {
      console.error(`Error ingesting item with ID ${id}:`, error);
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