export type StorageStatus = {
  mode: "memory" | "persistent";
  persistent: boolean;
  productionReady: boolean;
};

export function getStorageStatus(): StorageStatus {
  return {
    mode: "memory",
    persistent: false,
    productionReady: false,
  };
}
