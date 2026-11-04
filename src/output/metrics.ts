import { FILES } from '../shared/constants.ts';
import { logger } from '../shared/logger.ts';
import { volumeMetricsDataSchema } from '../shared/schemas.ts';
import type { BlipTimelineEntry, VolumeMetricsData } from '../shared/types.ts';

import { writeJSONFile } from '../data/repository.ts';
import { summarizeVolumeMetrics } from '../operations/metrics.ts';

export function generateVolumeMetrics(data: BlipTimelineEntry[]) {
  const metrics: VolumeMetricsData = {
    volumes: summarizeVolumeMetrics(data),
  };

  volumeMetricsDataSchema.parse(metrics);

  logger.info('Creating volume metrics file', FILES.DATA.METRICS);
  writeJSONFile(FILES.DATA.METRICS, metrics);

  return metrics;
}
