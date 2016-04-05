! function() {
    window.cordova && "undefined" != typeof require && require("cocoon-plugin-social-common.Social");
    var e = window.Cocoon;
    e.define("Cocoon.Social", function(i) {
        function t(e) {
            return function() {
                e && e()
            }
        }

        function n(e) {
            return 0 === e ? "connected" : 1 === e ? "not_authorized" : "unknown"
        }

        function s(e, i) {
            var t = null;
            return 0 === e.state && (t = {
                accessToken: e.accessToken,
                expirationDate: e.expirationDate,
                userID: e.user ? e.user.id : null,
                permissions: e.permissions,
                user: e.user
            }), {
                status: n(e.state),
                authResponse: t,
                error: i
            }
        }

        function r(i) {
            return new e.Social.User(i.id, i.username ? i.username : i.first_name + " " + i.last_name)
        }

        function o(e) {
            return {
                link: e.linkURL,
                description: e.message,
                name: e.linkText,
                caption: e.linkCaption,
                picture: e.mediaURL
            }
        }

        function a(i, t) {
            var n = new e.Social.Score(i.user.id, i.score, i.user.name);
            return t && (n.leaderboardID = t.leaderboardID), n.imageURL = "https://graph.facebook.com/" + i.user.id + "/picture", n
        }

        function c(i) {
            var t = new e.Social.Achievement(i.id, i.title, i.description, i.image[0].url, i.data.points);
            return t.fbAchievementData = i, t
        }
        return i.FacebookExtension = function() {
            return this._initialized = !1, this["native"] = !!window.cordova, this["native"] && (window.FB = this), this.Event = new e.Social.FacebookEvent(this["native"]), this.serviceName = "LDFacebookPlugin", this.onFacebookLoginStateChanged = new e.Signal, this.on = this.onFacebookLoginStateChanged.expose(), this
        }, i.FacebookExtension.prototype = {
            _currentSession: null,
            init: function(i, n) {
                var r = this;
                this._initialized = !0, this["native"] ? (e.exec(this.serviceName, "setListener", [], function(e, i) {
                    r._currentSession = s(e, i), 0 === e.state && r.Event.notify("auth.login", r._currentSession), r.Event.notify("auth.authResponseChange", r._currentSession), r.Event.notify("auth.statusChange", r._currentSession), r.onFacebookLoginStateChanged.emit("loginStatusChanged", null, [r._currentSession])
                }), e.exec(this.serviceName, "initialize", [i], t(n))) : (window.fbAsyncInit = function() {
                    FB.init(i), n && n()
                }, function(e, i, t) {
                    var n, s = e.getElementsByTagName(i)[0];
                    e.getElementById(t) || (n = e.createElement(i), n.id = t, n.src = "//connect.facebook.net/en_US/sdk.js", s.parentNode.insertBefore(n, s))
                }(document, "script", "facebook-jssdk"))
            },
            getSocialInterface: function() {
                if (!this._initialized) throw "You must call init() before getting the Social Interface";
                return this._socialService || (this._socialService = new e.Social.SocialGamingServiceFacebook(this)), this._socialService
            },
            login: function(i, t) {
                function n(e, i) {
                    r._currentSession = s(e, i), t && t(r._currentSession)
                }
                var r = this;
                this["native"] ? e.exec(this.serviceName, "login", [i], n, n) : FB.login(n, i)
            },
            logout: function(i) {
                var t = this;
                this["native"] ? e.exec(this.serviceName, "logout", [], function(e) {
                    t._currentSession = s(e), i && i(t._currentSession)
                }, !0) : FB.logout(function(e) {
                    t._currentSession = e, i && i(e)
                })
            },
            getAuthResponse: function() {
                return this["native"] ? this._currentSession : FB.getAuthResponse()
            },
            getLoginStatus: function(i, t) {
                if (this["native"]) {
                    var n = arguments.length > 0 ? arguments[0] : function() {},
                        r = arguments.length > 1 ? arguments[1] : !1;
                    e.exec(this.serviceName, "getLoginStatus", [r], function(e, i) {
                        n && n(s(e, i))
                    })
                } else FB.getLoginStatus(i, t)
            },
            api: function(i, t, n, s) {
                if (this["native"]) {
                    var r = arguments[0],
                        o = arguments.length > 3 ? arguments[1] : "GET",
                        a = null;
                    3 == arguments.length && (a = arguments[1]), 4 == arguments.length && (a = arguments[2]);
                    var c = arguments.length > 1 ? arguments[arguments.length - 1] : function() {};
                    return e.exec(this.serviceName, "api", [r, o, a], c, c)
                }
                FB.api(i, t, n, s)
            },
            ui: function(i, t) {
                if (this["native"]) {
                    var n = arguments[0],
                        s = arguments.length > 1 ? arguments[1] : function() {};
                    return e.exec(this.serviceName, "ui", [n], s, s)
                }
                FB.ui(i, t)
            },
            requestAdditionalPermissions: function(i, t, n) {
                if (this["native"]) {
                    var r = t.split(",");
                    e.exec(this.serviceName, "requestAdditionalPermissions", [i, r], function(e, i) {
                        n && n(s(e, i))
                    })
                } else FB.login(n, {
                    scope: t
                })
            },
			invite: function(appUrl, iconUrl, callback) {
                if (this.native) {

                     Cocoon.exec(this.serviceName, "invite", [appUrl, iconUrl], function(session, error){
                        if (callback) {
                            callback(toFBAPISession(session,error));
                        }
                    });
                }
                else {
                    FB.login(callback, {scope:permissions});
                }
            },
            getPermissions: function(e) {
                this.api("me/permissions", "GET", {
                    fields: "permission, status"
                }, function(i) {
                    for (var t = {}, n = i && i.data ? i.data : [], s = 0; s < n.length; ++s) "granted" === n[s].status && (t[n[s].permission] = !0);
                    e(t)
                })
            },
            showShareDialog: function(i, t) {
                this["native"] ? e.exec(this.serviceName, "showShareDialog", [i], t) : (i.method = "feed", FB.ui(i, t))
            },
            uploadPhoto: function(i, t) {
                this["native"] ? e.exec(this.serviceName, "uploadPhoto", [i], t) : t({
                    error: {
                        message: "Not implemented"
                    }
                })
            }
        }, i.FacebookEvent = function(e) {
            return this["native"] = e, this
        }, i.FacebookEvent.prototype = {
            subscribe: function(e, i) {
                if (this["native"]) {
                    var t = e + "listeners";
                    this[t] = this[t] || [], this[t].push(i)
                } else FB.Event.subscribe(e, i)
            },
            unsubscribe: function(e, i) {
                if (this["native"]) {
                    var t = e + "listeners",
                        n = this[t];
                    if (n) {
                        var s = n.indexOf(i); - 1 !== s && n.splice(s, 1)
                    }
                } else FB.Event.unsubscribe(e, i)
            },
            notify: function(e, i) {
                var t = e + "listeners",
                    n = this[t];
                if (n)
                    for (var s = 0; s < n.length; ++s) n[s](i)
            }
        }, i.Facebook = new i.FacebookExtension, i.SocialGamingServiceFacebook = function(i) {
            e.Social.SocialGamingServiceFacebook.superclass.constructor.call(this), this.fb = i;
            var t = this;
            return this.fb.Event.subscribe("auth.authResponseChange", function(e) {
                t.onLoginStatusChanged.emit("loginStatusChanged", null, ["connected" == e.status, e.error])
            }), this
        }, i.SocialGamingServiceFacebook.prototype = {
            currentPermissions: null,
            isLoggedIn: function() {
                return this.fb._currentSession && "connected" === this.fb._currentSession.status
            },
            login: function(e, i) {
                var t = this;
                this.fb.login(i, function(i, n) {
                    e && e(t.isLoggedIn(), i.error)
                })
            },
            logout: function(e) {
                this.fb.logout(function(i) {
                    e && e(i.error)
                })
            },
            getLoggedInUser: function() {
                var i = this.fb._currentSession ? this.fb._currentSession.authResponse : null;
                return i && i.user ? r(i.user) : i && i.userID ? new e.Social.Facebook.User(i.userID, "Loading...") : null
            },
            hasPublishPermissions: function(e) {
                this.fb.getPermissions(function(i, t) {
                    e(i.publish_actions, t)
                })
            },
            requestPublishPermissions: function(e) {
                var i = this;
                this.fb.requestAdditionalPermissions("publish", "publish_actions", function(t) {
                    t.error ? e(!1, error) : i.hasPublishPermissions(function(i, t) {
                        e(i, t)
                    })
                })
            },
            requestUser: function(e, i) {
                var t = i || "me";
                this.fb.api(t, function(i) {
                    var t = i.error ? null : r(i);
                    e(t, i.error)
                })
            },
            requestUserImage: function(i, t, n) {
                !t && this.isLoggedIn() && (t = this.fb._currentSession.authResponse.userID);
                var s = "small";
                n === e.Social.ImageSize.THUMB ? s = "square" : n === e.Social.ImageSize.MEDIUM ? s = "normal" : n === e.Social.ImageSize.LARGE && (s = "large");
                var r = "https://graph.facebook.com/" + t + "/picture?type=" + s;
                i(r)
            },
            requestFriends: function(e, i) {
                var t = (i || "me") + "/friends";
                this.fb.api(t, "GET", {
                    fields: "id, name, first_name, last_name, link"
                }, function(i) {
                    var t = [];
                    if (!i.error)
                        for (var n = 0; n < i.data.length; n++) t.push(r(i.data[n]));
                    e(t, i.error)
                })
            },
            preparePublishAction: function(e) {
                var i = this;
                this.currentPermissions ? this.currentPermissions.publish_actions ? e(!0) : (this.currentPermissions = this.currentPermissions | {}, this.fb.requestAdditionalPermissions("publish", "publish_actions", function(t) {
                    for (var n = t && t.authResponse ? t.authResponse.permissions : [], s = 0; s < n.length; ++s) i.currentPermissions[n[s]] = !0;
                    e(t.error ? !1 : !0)
                })) : this.fb.getPermissions(function(t) {
                    i.currentPermissions = t, t ? i.preparePublishAction(e) : e(!1)
                })
            },
            publishMessage: function(e, i) {
                this.preparePublishAction(function(t) {
                    if (t) {
                        var n = o(e),
                            s = "me/feed";
                        this.fb.api(s, n, function(e) {
                            i && i(e.error)
                        })
                    } else i && i({
                        message: "No publish_actions permission granted"
                    })
                })
            },
            publishMessageWithDialog: function(e, i) {
                this.fb.showShareDialog(o(e), function(e) {
                    i && i(e.error)
                })
            },
            requestScore: function(e, i) {
                var t = (i && i.userID ? i.userID : "me") + "/scores";
                this.fb.api(t, "GET", {
                    fields: "user, score"
                }, function(i) {
                    if (i.error) e(null, i.error);
                    else if (i.data && i.data.length > 0) {
                        var t = a(i.data[0]);
                        e(t, null)
                    } else e(null, null)
                })
            },
            submitScore: function(e, i, t) {
                var n = this;
                this.preparePublishAction(function(s) {
                    s ? n.requestScore(function(s, r) {
                        if (r) return void(i && i(r));
                        var o = s ? s.score : 0;
                        if (o >= e) return void(i && i(null));
                        var a = "/" + (t && t.userID ? t.userID : "me") + "/scores";
                        n.fb.api(a, "POST", {
                            score: e + ""
                        }, function(e) {
                            i && i(e.error)
                        })
                    }, t) : i && i({
                        message: "No publish_actions permission granted"
                    })
                })
            },
            showLeaderboard: function(i, t) {
                if (!this._leaderboardsTemplate) throw "Please, provide a html template for leaderboards with the setTemplates method";
                var n = new e.Widget.WebDialog,
                    s = !1;
                n.show(this._leaderboardsTemplate, function(e) {
                    n.closed = !0, !s && i && i(e)
                });
                var r = this;
                this.fb.api(r.fb._appId + "/scores", function(e) {
                    if (!n.closed) {
                        if (e.error) return void(i && (s = !0, i(e.error), n.close()));
                        var t = [];
                        if (e.data && e.data.length)
                            for (var o = 0; o < e.data.length; ++o) {
                                var c = a(e.data[o]);
                                c.position = o, c.imageURL = "https://graph.facebook.com/" + c.userID + "/picture", c.me = c.userID === r.fb._currentSession.authResponse.userID, t.push(c)
                            }
                        var u = "addScores(" + JSON.stringify(t) + ")";
                        n.eval(u)
                    }
                })
            },
            prepareAchievements: function(e, i) {
                if (!this._cachedAchievements || e) {
                    var t = this;
                    this.fb.api(this.fb._appId + "/achievements", function(e) {
                        if (e.error) i([], e.error);
                        else {
                            var n = [];
                            if (e.data)
                                for (var s = 0; s < e.data.length; s++) n.push(c(e.data[s]));
                            t.setCachedAchievements(n), i(n, null)
                        }
                    })
                } else i(this._cachedAchievements, null)
            },
            requestAllAchievements: function(e) {
                this.prepareAchievements(!0, e)
            },
            requestAchievements: function(e, i) {
                var t = this;
                this.prepareAchievements(!1, function(n, s) {
                    if (s) return void e([], s);
                    var r = (i || "me") + "/achievements";
                    t.fb.api(r, function(i) {
                        if (i.error) e([], i.error);
                        else {
                            var n = [];
                            if (i.data)
                                for (var s = 0; s < i.data.length; s++) {
                                    var r = t.findAchievement((i.data[s].achievement || i.data[s].data.achievement).id);
                                    r && n.push(r)
                                }
                            e(n, null)
                        }
                    })
                })
            },
            submitAchievement: function(e, i) {
                if (null === e || "undefined" == typeof e) throw "No achievementID specified";
                var t = this.translateAchievementID(e),
                    n = this;
                this.preparePublishAction(function(e) {
                    e ? n.fb.api("me/achievements", "POST", {
                        achievement: t
                    }, function(e) {
                        i && i(e.error)
                    }) : i && i({
                        message: "No publish_actions permission granted"
                    })
                })
            },
            resetAchievements: function(e) {
                var i = this;
                this.preparePublishAction(function(t) {
                    t ? i.requestAchievements(function(t, n) {
                        if (n) return void(e && e(n));
                        for (var s = null, r = t.length, o = 0; o < t.length; ++o) i.fb.api("me/achievements", "DELETE", {
                            achievement: t[o].fbAchievementData.url
                        }, function(i) {
                            i.error && (s = i.error), r--, 0 === r && e && e(s)
                        })
                    }) : e && e({
                        message: "No publish_actions permission granted"
                    })
                })
            },
            showAchievements: function(i) {
                if (!this._achievementsTemplate) throw "Please, provide a html template for achievements with the setTemplates method";
                var t = new e.Widget.WebDialog,
                    n = !1;
                t.show(this._achievementsTemplate, function(e) {
                    t.closed = !0, !n && i && i(e)
                });
                var s = this;
                this.requestAchievements(function(e, r) {
                    if (!t.closed) {
                        if (r) return n = !0, void(i && i(r));
                        var o = [];
                        if (s._cachedAchievements)
                            for (var a = 0; a < s._cachedAchievements.length; ++a) {
                                var c = s._cachedAchievements[a];
                                if (o.push(c), e && e.length)
                                    for (var u = 0; u < e.length; ++u)
                                        if (e[u].achievementID === c.achievementID) {
                                            c.achieved = !0;
                                            break
                                        }
                            }
                        var h = "addAchievements(" + JSON.stringify(o) + ");";
                        t.eval(h)
                    }
                })
            }
        }, e.extend(i.SocialGamingServiceFacebook, i.SocialGamingService), i
    })
}();