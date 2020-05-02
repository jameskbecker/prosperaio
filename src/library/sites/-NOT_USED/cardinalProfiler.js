let profileConfigurations = {
	referenceId: "X_XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX", //Cardinal_Id
	orgUnitId: "56099d28f723aa3e24d81c1b",
	features: {
		binConfigIdentifiers: null,
		cardinalDataCollection: true,
		geolocation: false,
		merchantMethodUrlCollection: {
			base64Payload: null,
			methodUrls: [],
		},
		threatMetrix: {
			alias: "Default",
			enabled: true,
			eventType: "PAYMENT",
			delay: "1500"
		},
	},
	origin: "Songbird",
	deviceChannel: "Browser",
	domain: "MERCHANT",
	environment: "PROD",
	nonce: null,
	threeDSServerTransId: null
};

window.Logger = function() {
	var e = function(e) {
		try {
			var t = {
				domain: "merchant",
				environment: "SBOX",
				appenders: ["ajax"],
				ajax: {
					queueSize: 25,
					enabledLevel: "error"
				}
			};
			this.configurations = {};
			if (e === undefined) {
				e = {}
			}
			$.extend(true, this.configurations, t, e);
			this.queue = []
		} catch (e) {}
	};
	e.prototype.sendLogs = function() {
		try {
			var e = this.queue.slice(this.queue.length - 1 - this.configurations.ajax.queueSize, this.queue.length),
				t = {
					sessionId: this.configurations.sessionId,
					logs: e,
					userAgent: navigator.userAgent,
					domain: this.configurations.domain
				},
				r = this.configurations.environment;
			$.ajax({
				method: "POST",
				url: "https://writer.cardinalcommerce.com/" + r.toLowerCase() + "/log",
				data: JSON.stringify(t),
				contentType: "application/json"
			})
		} catch (e) {}
	};
	e.prototype.log = function(e, t) {
		try {
			var r;
			if (e !== undefined && t === undefined) {
				t = e;
				e = "debug"
			}
			r = {
				level: e,
				message: t,
				time: new Date
			};
			this.queue.push(r);
			if (this.configurations.appenders.indexOf("console") > -1) {
				try {
					console[e](t)
				} catch (e) {}
			}
		} catch (e) {}
	};
	e.prototype.debug = function(e) {
		try {
			this.log("debug", e)
		} catch (e) {}
	};
	e.prototype.info = function(e) {
		try {
			this.log("info", e)
		} catch (e) {}
	};
	e.prototype.warn = function(e) {
		try {
			this.log("warn", e)
		} catch (e) {}
	};
	e.prototype.error = function(e) {
		try {
			this.log("error", e);
			this.sendLogs()
		} catch (e) {}
	};
	return e
}();
window.profiler = function(s, i) {
	var u, d = {
			BinConfigIdentifiers: null,
			Cookies: {
				Legacy: null,
				LocalStorage: null,
				SessionStorage: null
			},
			DeviceChannel: null,
			Extended: {
				Browser: {
					Adblock: null,
					AvailableJsFonts: null,
					DoNotTrack: null,
					JavaEnabled: navigator.javaEnabled()
				},
				Device: {
					ColorDepth: null,
					Cpu: null,
					Platform: null,
					TouchSupport: {
						MaxTouchPoints: null,
						OnTouchStartAvailable: null,
						TouchEventCreationSuccessful: null
					}
				}
			},
			Fingerprint: null,
			FingerprintingTime: null,
			FingerprintDetails: {
				Version: null
			},
			Language: navigator.language,
			Latitude: null,
			Longitude: null,
			OrgUnitId: null,
			Origin: null,
			Plugins: null,
			ReferenceId: null,
			Referrer: null,
			Screen: {
				FakedResolution: null,
				Ratio: null,
				Resolution: null,
				UsableResolution: null
			},
			ThreatMetrixEnabled: null,
			ThreatMetrixEventType: null,
			ThreatMetrixAlias: null,
			ThreeDSServerTransId: null,
			TimeOffset: null,
			UserAgent: navigator.userAgent,
			UserAgentDetails: {
				FakedOS: null,
				FakedBrowser: null
			}
		},
		c, a = [],
		e = {
			start: function(profileConfigurations) {	
				try {
					c = new Date;
					a;
					if (u === undefined) {
						u = new i({
							domain: profileConfigurations.domain,
							environment: profileConfigurations.environment,
							sessionId: profileConfigurations.referenceId
						})
					}
					var e = f.startCardinalDataCollection(profileConfigurations),
						t = f.startThreatMetrix(profileConfigurations),
						r = f.startMethodUrlProfiling(profileConfigurations);
					$.when(e, t, r).done(function(e, t, r) {
						if (e !== undefined) {
							a.push(e)
						}
						if (t !== undefined) {
							a.push(t)
						}
						if (r !== undefined) {
							a.push(r)
						}
						u.debug("profiling completed. Final results [" + JSON.stringify(a) + "]");
						if (profileConfigurations.domain === "ISSUER") {
							if (profileConfigurations.features !== undefined && profileConfigurations.features.notificationUrlData !== undefined && profileConfigurations.features.notificationUrlData.notificationUrl !== undefined) {
								f.redirectToNotificationURL(profileConfigurations.features.notificationUrlData.notificationUrl, profileConfigurations.features.notificationUrlData.base64Payload)
							} else {
								u.error("Unable to redirect to merchant NotificationUrl bad feature configuration data")
							}
						} else {
							window.messenger.profileCompleted("browser", a, profileConfigurations.nonce)
						}
					}).then(function() {
						u.info("Fingerprinting completed.");
						a = []
					})
				} catch (e) {
					u.error("Error while attempting to profile browser: " + e);
					a = []
				}
			}
		},
		f = {
			collectGeoLocation: function(e) {
				var t = $.Deferred(),
					r = {
						enableHighAccuracy: true,
						timeout: 5e3,
						maximumAge: 0
					};
				if (e) {
					var n = new Date;
					u.debug("Attempting to collect geolocational data");
					navigator.geolocation.getCurrentPosition(function(e) {
						u.debug("Successfully received locational data in [" + (new Date).getTime() - n.getTime() + "]ms");
						d.Latitude = e.coords.latitude;
						d.Longitude = e.coords.longitude;
						t.resolve()
					}, function(e) {
						u.error("Failed to collect location using browser API's: ", +e);
						t.resolve()
					}, r)
				} else {
					u.debug("Geolocation is not enabled, skipping.");
					t.resolve()
				}
				return t.promise()
			},
			createCardinalDataObject: function(e, t, r) {
				var n, i = new Date,
					a = i.getTime() - c.getTime();
				if (e.features.binConfigIdentifiers !== undefined) {
					n = JSON.parse(e.features.binConfigIdentifiers)
				}
				u.debug("Fingerprinter completed, creating data object taking [" + a + "]ms");
				d.BinConfigIdentifiers = f.filterNullStrings(n);
				d.BinSessionId = f.filterNullStrings(e.nonce);
				d.Cookies.Legacy = navigator.cookieEnabled;
				d.DeviceChannel = f.filterNullStrings(e.deviceChannel);
				d.Fingerprint = f.filterNullStrings(t);
				d.FingerprintingTime = a;
				d.FingerprintDetails.Version = s.VERSION;
				d.OrgUnitId = f.filterNullStrings(e.orgUnitId);
				d.Origin = f.filterNullStrings(e.origin);
				d.ReferenceId = f.filterNullStrings(e.referenceId);
				d.Referrer = document.referrer;
				d.ThreatMetrixAlias = f.filterNullStrings(e.features.threatMetrix.alias);
				d.ThreatMetrixEnabled = e.features.threatMetrix.enabled || false;
				d.ThreatMetrixEventType = f.filterNullStrings(e.features.threatMetrix.eventType);
				d.ThreeDSServerTransId = f.filterNullStrings(e.threeDSServerTransId);
				d.Screen.CCAScreenSize = f.pickScreenSize();
				for (var o = 0; o < r.length; o++) {
					var l = r[o];
					switch (l.key) {
						case "resolution":
							d.Screen.Resolution = l.value[0] + "x" + l.value[1];
							d.Screen.Ratio = l.value[0] / l.value[1];
							break;
						case "timezone_offset":
							d.TimeOffset = l.value;
							break;
						case "session_storage":
							d.Cookies.SessionStorage = f.restoreToBoolean(l.value);
							break;
						case "local_storage":
							d.Cookies.LocalStorage = f.restoreToBoolean(l.value);
							break;
						case "regular_plugins":
							d.Plugins = l.value;
							break;
						case "cpu_class":
							d.Extended.Device.Cpu = l.value;
							break;
						case "navigator_platform":
							d.Extended.Device.Platform = l.value;
							break;
						case "touch_support":
							d.Extended.Device.TouchSupport.MaxTouchPoints = l.value[0];
							d.Extended.Device.TouchSupport.TouchEventCreationSuccessful = l.value[1];
							d.Extended.Device.TouchSupport.OnTouchStartAvailable = l.value[2];
							break;
						case "color_depth":
							d.Extended.Device.ColorDepth = l.value;
							break;
						case "adblock":
							d.Extended.Browser.Adblock = l.value;
							break;
						case "js_fonts":
							d.Extended.Browser.AvailableJsFonts = l.value;
							break;
						case "do_not_track":
							if (l.value === "1") {
								d.Extended.Browser.DoNotTrack = "enabled"
							} else if (l.value === "0") {
								d.Extended.Browser.DoNotTrack = "disabled"
							} else if (l.value === null) {
								d.Extended.Browser.DoNotTrack = "not_set"
							} else {
								d.Extended.Browser.DoNotTrack = l.value
							}
							break;
						case "available_resolution":
							d.Screen.UsableResolution = l.value[0] + "x" + l.value[1];
							break;
						case "has_lied_resolution":
							d.Screen.FakedResolution = l.value;
							break;
						case "has_lied_os":
							d.UserAgentDetails.FakedOS = l.value;
							break;
						case "has_lied_browser":
							d.UserAgentDetails.FakedBrowser = l.value;
							break;
						default:
							break
					}
				}
			},
			filterNullStrings: function(e) {
				return e === "null" ? null : e
			},
			pickScreenSize: function() {
				var e = window.outerHeight,
					t = window.outerWidth,
					r = "02";
				if (t <= 400) {
					r = "01"
				} else if (t > 400 && t < 500) {
					r = "02"
				} else if (t >= 600) {
					if (e >= 450 && e < 650) {
						r = "04"
					} else if (e >= 650) {
						r = "03"
					}
				}
				return r
			},
			recordLocation: function(e) {
				u.debug("recording location using browser API's");
				d.Latitude = e.coords.latitude;
				d.Longitude = e.coords.longitude;
				f.storeData()
			},
			restoreToBoolean: function(e) {
				if (typeof e === "string") {
					return e === "true" ? true : false
				} else if (typeof e === "number") {
					return e === 1 ? true : false
				} else if (typeof e === "boolean") {
					return e
				} else {
					return false
				}
			},
			startCardinalDataCollection: function(r) {
				var n = $.Deferred(),
					e = navigator.userAgent,
					t = {},
					i;
				try {
					if (r.features.cardinalDataCollection) {
						i = e.match(/firefox/gi);
						if (i !== null && i.length > 0) {
							t.excludeCanvas = true
						}
						u.debug("Starting fingerprinting");
						if ("Fingerprint2" in window) {
							new s(t).get(function(e, t) {
								try {
									f.createCardinalDataObject(r, e, t);
									f.collectGeoLocation(f.restoreToBoolean(r.features.geolocationEnabled)).then(function() {
										return f.storeData(r)
									}).then(function() {
										n.resolve()
									})
								} catch (e) {
									u.error("Failed while processing the results of Fingerprinting: " + e);
									n.resolve()
								}
							})
						} else {
							u.error("Fingerprint2 missing, skipping Cardinal Data");
							n.resolve()
						}
					} else {
						u.info("Cardinal Data Collection is disabled");
						n.resolve()
					}
				} catch (e) {
					u.error("Failed to start cardinal data collection: " + e);
					n.resolve()
				}
				return n.promise()
			},
			startMethodUrlProfiling: function(e) {
				var t = $.Deferred();
				try {
					var r = e.features.merchantMethodUrlCollection;
					if (r !== undefined && r.methodUrls !== undefined && r.methodUrls.length > 0 && r.base64Payload !== undefined && r.base64Payload !== "") {
						r.environment = e.environment;
						r.referenceId = e.referenceId;
						r.threeDSServerTransId = e.threeDSServerTransId;
						u.info("Starting MethodURL Profiling");
						acsprofiler.start(r).then(function(e) {
							t.resolve(e)
						})
					} else {
						u.info("MethodURL collection is disabled");
						t.resolve()
					}
				} catch (e) {
					u.error("Failed while attempting to start method url profiling: " + e);
					t.resolve()
				}
				return t.promise()
			},
			startThreatMetrix: function(t) {
				try {
					if (t.features.threatMetrix.enabled) {
						var e = 0;
						try {
							if ("features" in t && "threatMetrix" in t.features && "delay" in t.features.threatMetrix && t.features.threatMetrix.delay !== "") {
								e = parseInt(t.features.threatMetrix.delay, 10)
							}
						} catch (e) {
							u.error("Failed to properly parse [" + t.features.threatMetrix.delay + "] as a number: " + e)
						}
						return f.waitForThreatMetrix(e)
					} else {
						u.info("ThreatMetrix is disabled");
						return $.Deferred().resolve()
					}
				} catch (e) {
					u.error("Failed to start thream metrix: " + e);
					return $.Deferred().resolve()
				}
			},
			storeData: function() {
				var t = {
					DataSource: "CardinalData",
					Status: false,
					ElapsedTime: -1
				};
				u.info("Sending data to save endpoint");
				return $.ajax({
					method: "POST",
					url: "../Browser/SaveBrowserData",
					data: JSON.stringify(d),
					contentType: "application/json"
				}).done(function() {
					u.info("SaveBrowserData request successfully sent");
					t.Status = true
				}).fail(function(e, t, r) {
					u.error("SaveBrowserData request failed: " + t);
					u.error(r)
				}).always(function() {
					var e = (new Date).getTime() - c.getTime();
					u.info("SaveBrowserDate completed [" + e + "]ms after starting profiling");
					t.ElapsedTime = e;
					a.push(t)
				}).then(null, function() {
					return $.Deferred().resolve()
				})
			},
			waitForThreatMetrix: function(e) {
				try {
					var t = $.Deferred(),
						r = {
							DataSource: "ThreatMetrix",
							Status: true,
							ElapsedTime: -1
						},
						n;
					if (e !== undefined && e > 0) {
						n = e - ((new Date).getTime() - c);
						if (n > 0) {
							u.debug("Waiting an additional [" + n + "]ms for threatMetrix delay");
							setTimeout(function() {
								u.info("ThreatMetrix wait time has completed");
								r.ElapsedTime = (new Date).getTime() - c;
								t.resolve(r)
							}, n)
						} else {
							var i = (new Date).getTime() - c;
							u.debug("Current execution time exceeds the threat metrix delay by [" + (i - e) + "]ms, marking threat metrix as completed");
							r.ElapsedTime = i;
							t.resolve(r)
						}
					} else {
						t.resolve(r)
					}
				} catch (e) {
					u.error("Failed while attempting to wait for Threat Metrix to finish: " + e);
					t.resolve(r)
				}
				return t.promise()
			},
			redirectToNotificationURL: function(e, t) {
				var r = document.createElement("form"),
					n = document.createElement("input");
				r.action = e;
				r.method = "POST";
				u.debug("injecting input info form");
				r.appendChild(n);
				n.type = "hidden";
				n.value = t;
				n.name = "threeDSMethodData";
				u.debug("Injecting form into page");
				document.body.appendChild(r);
				u.debug("Submitting Form");
				r.submit()
			}
		};
	return e
}(window.Fingerprint2, window.Logger);
window.messenger = function() {
	var e = {
		sendMessage: function(e) {
			parent.window.postMessage(JSON.stringify(e), "*")
		},
		profileCompleted: function(e, t, r) {
			var n = {
				MessageType: "profile.complete",
				Source: e,
				Type: "DF",
				Nonce: r,
				Results: t
			};
			window.messenger.sendMessage(n)
		}
	};
	return e
}();
window.isNaN = function(e) {
	var t = Number(e);
	return t !== t
};