import { Request, Response, NextFunction } from 'express';
import { lineChartOrdersOnMonth, pieChartOrdersOnMonth } from '../helpers/chart.helper';

class ChartController {
  public getLineChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lineChartData = await lineChartOrdersOnMonth();
      res.status(200).json(lineChartData);
    } catch {
      res.status(500).json({ message: 'Ошибка сервера!' });
    }
  };

  public getPieChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pieChartData = await pieChartOrdersOnMonth();
      res.status(200).json(pieChartData);
    } catch {
      res.status(500).json({ message: 'Ошибка сервера!' });
    }
  };
}

export default ChartController;
