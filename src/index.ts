import { Command, Option } from 'commander';
import { generateVolumes } from './files';
import { parseRadarSitemap } from './links';
import { generateMasterData } from './timeline';
const program = new Command();

program
  .name('tech-radar-volumes')
  .description('A CLI tool to fetch and process ThoughtWorks Tech Radar data')
  .option('-l, --links', 'fetch all radar blip page links from archive')
  .option('-d, --data', 'fetch detailed blip history from archive')
  .addOption(
    new Option('-v, --volumes <type>', 'generate CSV and JSON volumes').choices(
      ['all', 'csv', 'json'],
    ),
  );

program.parse(process.argv);

const options = program.opts();

if (options.links) {
  console.log('fetching all radar blip page links from sitemap');
  parseRadarSitemap();
} else if (options.data) {
  console.log('fetching detailed blip history from archive');
  generateMasterData();
} else if (options.volumes) {
  console.log(`generating ${options.volumes} volumes`);
  generateVolumes(options.volumes);
} else {
  console.log('fetching all radar blip page links from sitemap');
  parseRadarSitemap().then(() => {
    console.log('fetching detailed blip history from archive');
    generateMasterData().then(() => {
      console.log('generating all volumes');
      generateVolumes('all');
    });
  });
}
