/*
 * @Author: gongxi33
 * @Date: 2023-02-22 17:13:29
 * @LastEditTime: 2023-02-24 16:05:56
 * @LastEditors: gongxi33
 * @Description:
 * @FilePath: /rail-rn/rn/clientMethod.js
 */
/***
 * postJsCode.js
 * 预注入webview javascript code
 * web端使用：
 * window.APP.invokeClientMethod('getList', { page: 1 , size: 10}, callback);
 * * */
export default function clientMethod() {
	var APP = {
		__GLOBAL_FUNC_INDEX__: 0,
		invokeClientMethod: function (type, params, callback) {
			var callbackName;
			if (typeof callback === "function") {
				callbackName = "__CALLBACK__" + APP.__GLOBAL_FUNC_INDEX__++;
				APP[callbackName] = callback;
			}
			window.ReactNativeWebView.postMessage(
				JSON.stringify({ type, params, callback: callbackName }),
			);
		},
		invokeWebMethod: function (callback, args) {
			if (typeof callback === "string") {
				var func = APP[callback];
				if (typeof func === "function") {
					setTimeout(function () {
						func.call(this, args);
					}, 0);
				}
			}
		},
	};
	window.APP = APP;
	window.webviewCallback = function (data) {
		window.APP["invokeWebMethod"](data.callback, data.args);
	};
}
