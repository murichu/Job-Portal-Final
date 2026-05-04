// Simple geo stub (replace with ipinfo / MaxMind in production)
export const getGeoFromIP = async (ip) => {
  try {
    // placeholder values
    return {
      country: "Unknown",
      city: "Unknown",
    };
  } catch {
    return { country: "Unknown", city: "Unknown" };
  }
};
