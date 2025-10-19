import { requestClient } from '#/api/request';

enum InitializeApi {
  InitializeDatabase = '/fms-api/init/database',
}
export const initializeFileDatabase = () => {
  return requestClient.get(InitializeApi.InitializeDatabase);
};
