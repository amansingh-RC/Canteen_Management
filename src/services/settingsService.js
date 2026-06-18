import { mockRequest } from "@/services/apiClient";
import { mealTimings } from "@/data/mealTimings";
import {
  couponFormat,
  faceRecognition,
  notifications,
  roleAccess,
} from "@/data/settings";

export function getMealTimings() {
  return mockRequest(mealTimings);
}

export function getSystemSettings() {
  return mockRequest({ couponFormat, faceRecognition, notifications, roleAccess });
}

/** Persisting is a no-op in mock mode; swap to apiRequest(..., { method: "PUT" }). */
export function saveSettings(payload) {
  return mockRequest({ ok: true, saved: payload }, { latency: 500 });
}
