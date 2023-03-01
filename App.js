/*
 * @Author: gongxi33
 * @Date: 2023-02-10 10:27:06
 * @LastEditTime: 2023-03-01 11:24:19
 * @LastEditors: gongxi33
 * @Description:
 * @FilePath: /rail-rn/rn/App.js
 */
import { WebView } from "react-native-webview";
import { View, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useState, useEffect, useRef } from "react";
import clientMethod from "./clientMethod";
import { BleManager } from "react-native-ble-plx";
const patchPostMessageJsCode = `(${String(clientMethod)})(); true;`;

export default function App() {
	const [location, setLocation] = useState("");
	const [errorMsg, setErrorMsg] = useState(null);
	const manager = new BleManager();
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
	useEffect(() => {
		const subscription = manager.onStateChange((state) => {
			if (state === "PoweredOn") {
				// scanAndConnect();
				manager
					.getConnectedPeripherals([])
					.then((peripheralsArray) => {
						console.log("Connected devices:", peripheralsArray);
					})
					.catch((error) => {
						console.error(error);
					});
				subscription.remove();
			}
		}, true);
		return () => subscription.remove();
	}, [manager]);
	function scanAndConnect() {
		console.log("Escanear");
		manager.startDeviceScan(null, null, async (error, device) => {
			console.log(
				"🚀 ~ file: index.jsx:23 ~ manager.startDeviceScan ~ device",
				device,
			);
			console.log(device.id);
			if (
				device.id === "D1:42:78:C8:AB:FB" ||
				device.id === "D1:42:BF:F1:D9:3C"
			) {
				manager.stopDeviceScan();
				console.log("ID del dispositivo: ", device.id);
				console.log("Nombre del dispositivo: ", device.name);
				console.log("RRSI del dispositivo: ", device.rssi);
				console.log("MTU del dispositivo: ", device.mtu);

				device
					.connect()
					.then((device) => {
						const services =
							device.discoverAllServicesAndCharacteristics();

						console.log(services);
					})
					.catch((error) => {
						// Handle errors
						console.log(error);
					});
			}
			if (error) {
				console.log(error);
				return;
			}
		});
	}
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
		}
	};
	const runFirst = `
      window.railLocation = ${location};
      true; // note: this is required, or you'll sometimes get silent failures
    `;
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
				source={{ uri: "http://192.168.247.61:10086/" }}
				onMessage={onMessage}
				// injectedJavaScript={patchPostMessageJsCode}
				injectedJavaScriptBeforeContentLoaded={runFirst}
			/>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
