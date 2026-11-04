import { FILES } from '../shared/constants.ts';
import { logger } from '../shared/logger.ts';
import { volumeMetricsDataSchema } from '../shared/schemas.ts';
import type { BlipTimelineEntry, VolumeMetricsData } from '../shared/types.ts';

import { readJSONFile, writeJSONFile } from '../data/repository.ts';
import { summarizeVolumeMetrics } from '../operations/metrics.ts';

function getSheetName(volume: number, publishedDate: string) {
  return `Vol ${volume} (${publishedDate})`;
}

function readExistingSheetGids(): Map<string, number> {
  const gids = new Map<string, number>();

  try {
    const existing = readJSONFile<VolumeMetricsData>(
      FILES.DATA.METRICS,
      volumeMetricsDataSchema,
    );

    for (const volume of existing.volumes) {
      if (volume.sheetGid !== null) {
        gids.set(
          getSheetName(volume.volume, volume.publishedDate),
          volume.sheetGid,
        );
      }
    }
  } catch {
    // A missing or stale metrics file should not block regenerating it.
  }

  return gids;
}

export function generateVolumeMetrics(
  data: BlipTimelineEntry[],
  sheetGids?: Map<string, number>,
) {
  const metrics: VolumeMetricsData = {
    volumes: summarizeVolumeMetrics(data),
  };
  const gids = sheetGids ?? readExistingSheetGids();

  for (const volume of metrics.volumes) {
    volume.sheetGid =
      gids.get(getSheetName(volume.volume, volume.publishedDate)) ?? null;
  }

  volumeMetricsDataSchema.parse(metrics);

  logger.info('Creating volume metrics file', FILES.DATA.METRICS);
  writeJSONFile(FILES.DATA.METRICS, metrics);

  return metrics;
}
