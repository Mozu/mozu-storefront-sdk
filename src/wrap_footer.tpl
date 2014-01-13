   ;
			return <%= toExport %>;
		});
		// UMD boilerplate
	})(typeof externalDefine === "function" && externalDefine.amd
		? externalDefine
		: function (factory) {
			typeof exports === "object" && typeof module === "object"
				? (module.exports = factory())
				: root.<%= exportAs %> = factory()
		}
	);
    // put that back where you found it, young man
    root.define = externalDefine;
}(this));