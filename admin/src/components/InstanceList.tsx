import Connection from "@iobroker/adapter-react/Connection";
import * as React from "react";
import DeviceList from "./DeviceList";

type InstanceMap = Record<string, InstanceInfo>;

export interface InstanceInfo {
	title: string;
	instance: number;
}

export default function InstanceList(params: { socket: Connection }) {
	const { socket } = params;
	const [instanceList, setInstanceList] = React.useState<InstanceMap>({});

	React.useEffect(() => {
		const loadAdapters = async () => {
			console.log("Waiting for connection");
			await socket.waitForFirstConnection();
			console.log("Loading adapters...");
			const result = await socket.sendTo("dm.0", "listInstances");
			setInstanceList(result as any as InstanceMap);
			console.log({ result });
		};
		loadAdapters().catch(console.error);
	}, []);

	return (
		<div>
			{Object.entries(instanceList).map(([id, instance]) => (
				<DeviceList key={id} instanceId={id} instance={instance} socket={socket} />
			))}
		</div>
	);
}
