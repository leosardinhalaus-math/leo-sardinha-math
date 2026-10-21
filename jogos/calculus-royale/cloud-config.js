// Preserve the current provider until Firebase has been connected and its rules deployed.
// Only the public Web App configuration belongs here; never put an Admin SDK key here.
window.CalculusCloudConfig = Object.freeze({
  provider: 'supabase',
  firebase: null
});
