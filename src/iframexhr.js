// BEGIN IFRAMEXHR
var utils = require('./utils');
var IframeXHR = (function (window, document, undefined) {

    var hasPostMessage = window.postMessage && navigator.userAgent.indexOf("Opera") === -1,
        firefoxVersion = (function () {
            var ua = navigator.userAgent,
                re = /Firefox\/(\d+)/i,
                match = ua.match(re),
                versionStr = parseInt(match ? (match[1] || false) : false),
                version = isNaN(versionStr) ? false : versionStr;

            return version;
        }()),
        cacheBust = 1,
        hashRE = /^#?\d+&/,
        originRE = /^https?:\/\/[^/]+/i,
        validateOrigin = function (ixhr, origin) {
            return ixhr.frameOrigin === origin.toLowerCase().match(originRE)[0];
        },
        messageDelimiter = '|||||',
        messageMethods = hasPostMessage ? {
            listen: function () {
                var self = this;
                this.messageListener = function (e) {
                    if (!e) e = window.event;
                    if (!validateOrigin(self, e.origin)) throw new Error("Origin " + e.origin + " does not match required origin " + self.frameOrigin);
                    if (e.data === "ready") return self.postMessage();
                    self.update(e.data);
                };
                window.addEventListener('message', this.messageListener, false);
            },
            postMessage: function () {
                return this.getFrameWindow().postMessage(this.getMessage(), this.frameOrigin);
            },
            detachListeners: function () {
                window.removeEventListener('message', this.messageListener, false);
            }
        } : {
            listen: function () {
                var self = this;
                this.interval = setInterval(function () {
                    var data;
                    self.hash = document.location.hash;
                    data = self.hash.replace(hashRE, '');
                    if (self.hash !== self.lastHash) {
                        if (data === "ready") return self.postMessage();

                        if (hashRE.test(self.hash)) {
                            self.lastHash = self.hash;
                            self.update(data);
                        }
                    }
                }, 100);
            },
            postMessage: function (message) {
                this.getFrameWindow().location = this.frameUrl.replace(/#.*$/, '') + '#' + (+new Date) + (cacheBust++) + '&' + this.getMessage();
            },
            detachListeners: function () {
                clearInterval(this.interval);
                this.interval = null;
            }
        };

    var IframeXMLHttpRequest = function (frameUrl) {
        var frameMatch = frameUrl.match(originRE);
        if (!frameMatch || !frameMatch[0]) throw new Error(frameUrl + " does not seem to have a valid origin.");
        this.frameOrigin = frameMatch[0].toLowerCase();
        this.frameUrl = frameUrl + "?&parenturl=" + encodeURIComponent(location.href) + "&parentdomain=" + encodeURIComponent(location.protocol + '//' + location.host) + "&messagedelimiter=" + encodeURIComponent(messageDelimiter);
        this.headers = {};
    };

    utils.extend(IframeXMLHttpRequest.prototype, messageMethods, {
        readyState: 0,
        status: 0,
        open: function (method, url) {
            this.readyState = 1;
            this.method = method;
            this.url = url;
        },
        send: function (data) {
            this.messageBody = data;
            this.listen();
            this.createIframe();
        },
        createIframe: function () {
            this.iframe = document.createElement('iframe');
            this.iframe.style.position = 'absolute';
            this.iframe.style.left = '-9999px';
            this.iframe.style.width = '1px';
            this.iframe.style.height = '1px';
            this.iframe.src = this.frameUrl;
            document.body.appendChild(this.iframe);
        },
        setRequestHeader: function (key, value) {
            this.headers[key] = value;
        },
        getMessage: function () {
            var msg = [this.url, this.messageBody, this.method];
            for (var header in this.headers) {
                msg.push(header, this.headers[header]);
            }
            return msg.join(messageDelimiter);
        },
        onreadystatechange: function () { },
        getFrameWindow: function () {
            return this.iframe.contentWindow || this.iframe;
        },
        cleanup: function () {
            var self = this;
            if (!self.destroyed) setTimeout(function () {
                self.detachListeners();
                self.iframe.parentNode && self.iframe.parentNode.removeChild(self.iframe);
            }, 250);
            self.destroyed = true;
        },
        update: function(data) {
            data = data.split(messageDelimiter);
            this.readyState = parseInt(data[0]) || 0;
            this.status = parseInt(data[1]) || 0;
            this.responseText = data[2];
            this.onreadystatechange();
            if (this.readyState === 4) this.cleanup();
        },
        abort: function () {
            this.status = 0;
            this.readyState = 0;
            this.cleanup();
        }
    });

    return IframeXMLHttpRequest;

}(this, this.document));
// END IFRAMEXHR