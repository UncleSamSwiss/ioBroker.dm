import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ButtonGroup from "@mui/material/ButtonGroup";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { DeviceDetails, JsonFormData } from "dm-utils";
import { DeviceInfo } from "dm-utils/build/types/api";
import * as React from "react";
import { DeviceActionButton } from "./DeviceActionButton";
import { ActionContext } from "./DeviceList";
import { DeviceStatus } from "./DeviceStatus";
import { JsonConfig } from "./JsonConfig";

export function DeviceRow(props: {
	instance: string;
	device: DeviceInfo;
	hasDetails: boolean;
	hasActions: boolean;
	context: ActionContext;
}) {
	const { instance, device, hasDetails, hasActions, context } = props;

	const [open, setOpen] = React.useState(false);
	const [details, setDetails] = React.useState<DeviceDetails>();
	const [data, setData] = React.useState<JsonFormData>({});

	const loadDetails = async () => {
		console.log(`Loading device details for ${device.id}...`);
		const result = await context.socket.sendTo(instance, "dm:deviceDetails", device.id);
		setDetails(result as any as DeviceDetails);
	};
	const refresh = () => {
		setDetails(undefined);
		loadDetails().catch(console.error);
	};

	React.useEffect(() => setData(details?.data || {}), [details]);

	React.useEffect(() => {
		if (!open) {
			setDetails(undefined);
			return;
		}
		loadDetails().catch(console.error);
	}, [open]);

	return (
		<>
			<TableRow>
				{hasDetails && (
					<TableCell>
						{device.hasDetails && (
							<IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
								{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
							</IconButton>
						)}
					</TableCell>
				)}
				<TableCell>{device.id}</TableCell>
				<TableCell>{device.name}</TableCell>
				<TableCell>
					<DeviceStatus status={device.status}></DeviceStatus>
				</TableCell>
				{hasActions && (
					<TableCell>
						{!!device.actions?.length && (
							<ButtonGroup size="small" sx={{ height: 36 }}>
								{device.actions.map((a) => (
									<DeviceActionButton
										key={a.id}
										deviceId={device.id}
										action={a}
										refresh={refresh}
										context={context}
									/>
								))}
							</ButtonGroup>
						)}
					</TableCell>
				)}
			</TableRow>
			{open && (
				<TableRow>
					<TableCell colSpan={hasActions ? 5 : 4} sx={{ backgroundColor: "#EEEEEE" }}>
						{details && (
							<JsonConfig
								instanceId={instance}
								socket={context.socket}
								schema={details.schema}
								data={data}
								onChange={setData}
							/>
						)}
					</TableCell>
				</TableRow>
			)}
		</>
	);
}
