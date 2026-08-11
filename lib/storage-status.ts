import { getStorageReadiness } from "@/lib/storage/config";

export type StorageStatus = {
  mode: "memory" | "postgres";
  persistent: boolean;
  productionReady: boolean;
};

export function getStorageStatus(): StorageStatus {
  const readiness = getStorageReadiness();
  return {
    mode: readiness.mode,
    persistent: readiness.persistent,
    productionReady: readiness.persistent,
  };
}
