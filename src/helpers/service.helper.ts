import { IFormattedServices, IService } from '../interfaces/service.interface';
import { SERVICE_TYPE } from '../constants';

class ServiceHelper {
  private formatServiceItem = (serviceItem: any): IService => {
    return {
      ...serviceItem,
      name: serviceItem.name.length > 25 ? serviceItem.name.slice(0, 25).concat('...') : serviceItem.name,
      description:
        serviceItem.name.length < 17
          ? serviceItem.description.length > 90
            ? serviceItem.description.slice(0, 90).concat('...')
            : serviceItem.description
          : serviceItem.description.length > 60
          ? serviceItem.description.slice(0, 60).concat('...')
          : serviceItem.description,
    };
  };

  public formatServices = async (services: IService[]): Promise<IFormattedServices[]> => {
    const formattedServices = services.reduce((acc: IFormattedServices[], current) => {
      const index = acc.findIndex((node) => node.serviceType === current.type);

      if (index === -1) {
        acc.push({
          serviceType: current.type,
          serviceName: SERVICE_TYPE.find(({ type }) => type === current.type)?.showName || '',
          serviceList: [this.formatServiceItem(current)],
        });

        return acc;
      }

      acc[index].serviceList.push(this.formatServiceItem(current));
      return acc;
    }, []);

    return formattedServices;
  };
}

export default ServiceHelper;
