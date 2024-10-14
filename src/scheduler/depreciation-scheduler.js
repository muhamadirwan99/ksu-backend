import { generateDate } from "../utils/generate-date.js";

import { logger } from "../application/logging.js";
import cron from "node-cron";
import depreciationService from "../service/depreciation-service.js";

// Schedule the cron job to run every year on January 1st at midnight
cron.schedule("0 0 1 1 *", async () => {
  try {
    const currentYear = generateDate().getFullYear();

    logger.info(`Calculating depreciation for the year: ${currentYear}`);

    // Call the depreciation calculation function for the current year
    const result = await depreciationService.calculateDepreciation(currentYear);

    logger.info("Depreciation calculation completed successfully.");
    logger.info(result); // Optional: Log the result for review
  } catch (error) {
    logger.error("Error calculating depreciation:", error);
  }
});

logger.info("Depreciation cron job scheduled.");
