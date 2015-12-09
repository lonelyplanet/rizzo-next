export default function isDev() {
  return (typeof ENV_PROD !== "undefined" && !ENV_PROD) || document.cookie.indexOf("lpDev") > -1;
}
