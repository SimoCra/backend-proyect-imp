import { getDashboardStatsService } from '../service/userService.js';

export const getDashboardStatsController = async (req, res) => {
  try {
    const stats = await getDashboardStatsService();
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error });
  }
};
