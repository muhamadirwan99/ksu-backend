import { ResponseSuccess } from "../utils/response-success.js";
import { generateDate } from "../utils/generate-date.js";
import { logger } from "../application/logging.js";
import depreciationService from "../service/depreciation-service.js";

const getDepreciation = async (req, res, next) => {
  try {
    const currentYear = generateDate().getFullYear();

    logger.info(`Calculating depreciation for the year: ${currentYear}`);

    // Call the depreciation calculation function for the current year
    const result = await depreciationService.calculateDepreciation(currentYear);

    const responses = new ResponseSuccess(
      `Depreciation ${currentYear} successfully registered`,
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  getDepreciation,
};
