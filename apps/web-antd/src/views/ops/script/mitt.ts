import { mitt } from '@vben/utils';

type Events = {
  categorySelected: number | null;
  scriptUpdated: void;
  categoryUpdated: void;
};

export const emitter = mitt<Events>();
