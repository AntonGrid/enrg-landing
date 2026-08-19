// js/device-store.js — localStorage helpers для симулируемых устройств

const DEVICES_LIST_KEY = "enrg_devices";
const deviceKey = (deviceId) => `enrg_device_${deviceId}`;

// Список device_id из localStorage["enrg_devices"]
export function getStoredDevices() {
  try {
    const raw = localStorage.getItem(DEVICES_LIST_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// Объект устройства из localStorage["enrg_device_<id>"]
export function getDeviceFromStorage(deviceId) {
  try {
    const raw = localStorage.getItem(deviceKey(deviceId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Сохранить/обновить устройство и список id
export function saveDeviceToStorage(device) {
  const list = getStoredDevices();
  if (!list.includes(device.device_id)) {
    list.push(device.device_id);
    localStorage.setItem(DEVICES_LIST_KEY, JSON.stringify(list));
  }
  localStorage.setItem(deviceKey(device.device_id), JSON.stringify(device));
}
