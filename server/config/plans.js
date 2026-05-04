export const PLAN_LIMITS = {
  starter: {
    users: 5,
    jobs: 25,
    downloads: 500,
    features: ["jobs:create", "jobs:list", "analytics:basic"],
  },
  growth: {
    users: 25,
    jobs: 150,
    downloads: 5000,
    features: ["jobs:create", "jobs:list", "analytics:basic", "analytics:advanced", "mpesa:billing"],
  },
  enterprise: {
    users: 500,
    jobs: 5000,
    downloads: 100000,
    features: ["*"],
  },
};

export const hasPlanFeature = (plan, feature) => {
  const features = PLAN_LIMITS[plan]?.features || [];
  return features.includes("*") || features.includes(feature);
};
