export const NEWBEE_LOGO_SRC = `${import.meta.env.BASE_URL}newbee-logo.png`;

const LEGACY_LOGO_SRC =
  "https://simpleadmin-2024.oss-cn-shanghai.aliyuncs.com/logo.png";

export function resolveLogoSource(source?: string) {
  return !source || source === LEGACY_LOGO_SRC ? NEWBEE_LOGO_SRC : source;
}
