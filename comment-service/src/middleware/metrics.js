// Metrics storage
const metrics = {
  requests_total: 0,
  errors_total: 0,
};

// Increment request counter
const incrementRequests = () => {
  metrics.requests_total++;
};

// Increment error counter
const incrementErrors = () => {
  metrics.errors_total++;
};

// Get metrics
const getMetrics = () => {
  return {
    requests_total: metrics.requests_total,
    errors_total: metrics.errors_total,
  };
};

// Reset metrics (useful for testing)
const resetMetrics = () => {
  metrics.requests_total = 0;
  metrics.errors_total = 0;
};

module.exports = {
  incrementRequests,
  incrementErrors,
  getMetrics,
  resetMetrics,
};

