module.exports = function(Client) {
  return Client.sub({
    adminuser: require('./platform/adminuser')(Client),
    applications: require('./platform/applications')(Client),
    developer: require('./platform/developer')(Client),
    tenants: require('./platform/tenants')(Client)
  });
}