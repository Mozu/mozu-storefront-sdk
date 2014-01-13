ApiObject.types.login = {
    postconstruct: function (type, json) {
        var accessToken;
        if (json.authTicket && json.authTicket.accessToken) {
            accessToken = json.authTicket.accessToken;
        } else if (json.accessToken) {
            accessToken = json.accessToken;
        }
        if (accessToken) {
            this.api.context.UserClaims(accessToken);
            this.api.fire('login', json);
        }
    }
};