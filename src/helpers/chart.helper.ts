import Order from '../app/models/orderedServices';
import { ILineChart, IPieChart } from '../interfaces/chart.interface';

export const lineChartOrdersOnMonth = async () => {
  const line: ILineChart[] = [];

  line.push({ date: new Date(Date.now()), value: 0, showDate: '' });
  line[0].date.setHours(3);
  line[0].date.setMinutes(0);
  line[0].showDate = line[0].date.toString();

  for (let i = 0; i < 29; i++) {
    line.push({ date: new Date(line[i].date), value: 0, showDate: '' });
    line[i + 1].date.setHours(line[i].date.getHours() + 24);
    line[i + 1].showDate = line[i + 1].date.toString();
  }

  await Promise.all(
    line.map(async (chartLine) => {
      const dateEnd = new Date(chartLine.date);
      dateEnd.setHours(26);
      try {
        await Order.find({ startTime: { $gte: chartLine.date, $lt: dateEnd }, status: true })
          .exec()
          .then(async (orders) => {
            if (orders) {
              await orders.forEach((order) => {
                chartLine.value += order.orders.length;
              });
            }
          })
          .catch(() => []);
      } catch (e) {
        console.log('exception');
      }
    })
  );
  return line;
};

export const pieChartOrdersOnMonth = async () => {
  const PIE: IPieChart[] = [
    { type: 'massage', typeRus: 'Услуги Массажа', value: 0 },
    { type: 'barber', typeRus: 'Услуги парикмахера', value: 0 },
    { type: 'manicure', typeRus: 'Услуги мастера манекюра', value: 0 },
  ];

  await Promise.all(
    PIE.map(async (chartPie) => {
      await Order.find({ 'orders.type': chartPie.type, status: true })
        .exec()
        .then(async (count) => {
          await count.forEach((orders) => {
            orders.orders.forEach((order) => {
              if (order.type === chartPie.type) {
                chartPie.value++;
              }
            });
          });
        });
    })
  );

  return PIE;
};
