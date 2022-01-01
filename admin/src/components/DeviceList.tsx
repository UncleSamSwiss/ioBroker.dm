import React from "react";
import Connection from "@iobroker/adapter-react/Connection";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { DeviceAction, DeviceInfo, InstanceAction, JsonFormData, JsonFormSchema } from "../types";
import { InstanceInfo } from "./InstanceList";
import { DeviceRow } from "./DeviceRow";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { JsonConfig } from "./JsonConfig";

function _(text: string) {
	return text;
}
export interface ActionContext {
	readonly socket: Connection;
	instanceHandler(action: InstanceAction): () => void;
	deviceHandler(deviceId: string, action: DeviceAction, refresh?: () => void): () => void;
	getTranslation(text: ioBroker.StringOrTranslated | undefined): string;
}

export default function DeviceList(params: { instanceId: string; instance: InstanceInfo; socket: Connection }) {
	const { instanceId, instance, socket } = params;
	const [loaded, setLoaded] = React.useState<boolean>(false);
	const [devices, setDevices] = React.useState<DeviceInfo[]>([]);
	const [openDialog, setOpenDialog] = React.useState<"message" | "confirm" | "form">();
	const [message, setMessage] = React.useState<{ message: string; handleClose: () => void }>();
	const [confirm, setConfirm] = React.useState<{ message: string; handleClose: (ok: boolean) => void }>();
	const [form, setForm] =
		React.useState<{ schema: JsonFormSchema; data: JsonFormData; handleClose: (data?: JsonFormData) => void }>();

	const loadDevices = async () => {
		console.log(`Loading devices for ${instanceId}...`);
		const result = await socket.sendTo(instanceId, "dm:listDevices");
		setDevices(result as any as DeviceInfo[]);
		console.log("listDevices", { result });
	};

	const getTranslation = (text: ioBroker.StringOrTranslated | undefined): string => {
		if (typeof text === "string") {
			return text;
		} else if (typeof text === "object") {
			return text[socket.systemLang] || "";
		} else {
			return "";
		}
	};

	const sendActionToInstance = (command: string, message: Record<string, any>, refresh?: () => void): void => {
		const send = async (): Promise<void> => {
			const result = await socket.sendTo(instanceId, command, message);
			const response = result as Record<string, any>;
			const type: string = response.type;
			switch (type) {
				case "message":
					setMessage({
						message: response.message,
						handleClose: () => {
							setOpenDialog(undefined);
							sendActionToInstance("dm:actionProgress", { origin: response.origin });
						},
					});
					setOpenDialog("message");
					break;
				case "confirm":
					setConfirm({
						message: response.confirm,
						handleClose: (confirm: boolean) => {
							setOpenDialog(undefined);
							sendActionToInstance("dm:actionProgress", { origin: response.origin, confirm });
						},
					});
					setOpenDialog("confirm");
					break;
				case "form":
					setForm({
						...response.form,
						handleClose: (data?: JsonFormData) => {
							console.log(JSON.stringify({ data }));
							sendActionToInstance("dm:actionProgress", {
								origin: response.origin,
								data: data,
							});
							setOpenDialog(undefined);
						},
					});
					setOpenDialog("form");
					break;
				case "result":
					if (response.result.refresh === true || response.result.refresh === "instance") {
						setDevices([]);
						await loadDevices();
					} else if (response.result.refresh === "device") {
						if (refresh) {
							refresh();
						}
					} else {
						console.log("Not refreshing anything");
					}
					break;
			}
		};
		send().catch(console.error);
	};

	const actionContext: ActionContext = {
		socket,
		instanceHandler: (action: InstanceAction) => {
			return () => sendActionToInstance("dm:instanceAction", { actionId: action.id });
		},
		deviceHandler: (deviceId: string, action: DeviceAction, refresh: () => void) => {
			return () => sendActionToInstance("dm:deviceAction", { actionId: action.id, deviceId }, refresh);
		},
		getTranslation,
	};

	const handleChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
		if (!isExpanded || loaded) {
			return;
		}

		setLoaded(true);
		loadDevices().catch(console.error);
	};

	const handleFormChange = (data: JsonFormData) => {
		setForm((old) => (old ? { ...old, data } : undefined));
	};

	const hasDetails = devices.some((d) => d.hasDetails);
	const hasActions = devices.some((d) => d.actions?.length);

	return (
		<>
			<Accordion onChange={handleChange}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography variant="h5">{instanceId}</Typography>
					<Typography>{instance.title}</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									{hasDetails && <TableCell> </TableCell>}
									<TableCell>{_("ID")}</TableCell>
									<TableCell>{_("Name")}</TableCell>
									<TableCell>{_("Status")}</TableCell>
									{hasActions && <TableCell>{_("Actions")}</TableCell>}
								</TableRow>
							</TableHead>
							<TableBody>
								{devices.map((d) => (
									<DeviceRow
										key={d.id}
										instance={instanceId}
										device={d}
										hasDetails={hasDetails}
										hasActions={hasActions}
										context={actionContext}
									></DeviceRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</AccordionDetails>
			</Accordion>
			<Dialog
				open={openDialog === "message"}
				onClose={() => message?.handleClose()}
				aria-describedby="message-dialog-description"
			>
				<DialogContent>
					<DialogContentText id="message-dialog-description">{message?.message}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => message?.handleClose()} autoFocus>
						OK
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				open={openDialog === "confirm"}
				onClose={() => confirm?.handleClose(false)}
				aria-describedby="confirm-dialog-description"
			>
				<DialogContent>
					<DialogContentText id="confirm-dialog-description">{confirm?.message}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => confirm?.handleClose(false)}>Cancel</Button>
					<Button onClick={() => confirm?.handleClose(true)} autoFocus>
						OK
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={openDialog === "form"} onClose={() => form?.handleClose()}>
				<DialogContent>
					{form && (
						<JsonConfig
							instanceId={instanceId}
							schema={form.schema}
							data={form.data}
							socket={socket}
							onChange={handleFormChange}
						/>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => form?.handleClose()}>Cancel</Button>
					<Button onClick={() => form?.handleClose(form?.data)} autoFocus>
						OK
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
