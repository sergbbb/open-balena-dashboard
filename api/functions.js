export const getOsName = function (deviceType, version) {
  return deviceType + '-' + version + '.img'
}

export const getOsPath = function (deviceType, version) {
  const osName = getOsName(deviceType, version)
  return process.cwd() + '/data/' + osName
}
