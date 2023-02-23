/*
 * @Author: gongxi33
 * @Date: 2023-02-10 10:27:06
 * @LastEditTime: 2023-02-23 10:22:22
 * @LastEditors: gongxi33
 * @Description:
 * @FilePath: /rail-rn/rn/App.js
 */
import { WebView } from "react-native-webview";
import { View, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useState, useEffect, useRef } from "react";
import clientMethod from "./clientMethod";
const patchPostMessageJsCode = `(${String(clientMethod)})(); true;`;

export default function App() {
	const [location, setLocation] = useState(null);
	const [errorMsg, setErrorMsg] = useState(null);

	const webviewRef = useRef();
	useEffect(() => {
		(async () => {
			const { status } =
				await Location.requestForegroundPermissionsAsync();

			if (status === "granted") {
				console.log("Approved!!");
				const location = await Location.getCurrentPositionAsync({});
				console.log("🚀 ~ file: App.js:38 ~ location:", location);
				// setLatitude(location.latitude);
				// setLongitude(location.longitude);
				setLocation(`${location.longitude}, ${location.latitude}`);
			} else {
				console.log("Rejected!");
				throw new Error("Location permission not granted");
			}
		})();
	}, []);

	const onMessage = (event) => {
		var data = JSON.parse(event.nativeEvent.data);
		console.log("🚀 ~ file: App.js:44 ~ onMessage ~ data:", data);
		if (!data) {
			return;
		}
		const { type, params, callback } = data;
		switch (type) {
			case "getUser":
				const json = {
					callback,
					args: location,
				};
				webviewRef.current.injectJavaScript(
					`webviewCallback(${JSON.stringify(json)})`,
				);
				break;

			// 导航到 app 指定 screen/page
			case "navigate":
				const { screen } = params;
				this.props.navigation.navigate(screen);
				break;
		}
	};

	return (
		<View style={styles.container}>
			<WebView
				ref={webviewRef}
				style={styles.container}
				javaScriptEnabled={true}
				originWhitelist={["*"]}
				javaScriptEnabledAndroid={true}
				allowFileAccess={true}
				allowsBackForwardNavigationGestures
				onLoad={() => {}}
				source={{ uri: "http://139.196.11.66:8009/" }}
				onMessage={onMessage}
				injectedJavaScript={patchPostMessageJsCode}
			/>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
