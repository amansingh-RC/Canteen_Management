export const faceRecognition = {
  confidenceThreshold: 85,
  retryLimit: 2,
  retryOptions: [2, 3, 5],
};

export const notifications = {
  smsAlerts: true,
  emailAlerts: true,
};

export const roleAccess = [
  { role: "Admin", access: "Full access" },
  { role: "Manager", access: "Reports + monitoring" },
  { role: "Operator", access: "Verification only" },
];
