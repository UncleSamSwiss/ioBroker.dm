import Connection from "@iobroker/adapter-react/Connection";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { JsonFormData, JsonFormSchema } from "dm-utils";
import { DeviceAction, DeviceInfo, InstanceAction, InstanceDetails } from "dm-utils/build/types/api";
import React from "react";
import { DeviceRow } from "./DeviceRow";
import { InstanceActionButton } from "./InstanceActionButton";
import { InstanceInfo } from "./InstanceList";
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
	const [instanceDetails, setInstanceDetails] = React.useState<InstanceDetails>();
	const [devices, setDevices] = React.useState<DeviceInfo[]>([]);
	const [showSpinner, setShowSpinner] = React.useState<boolean>(false);
	const [openDialog, setOpenDialog] = React.useState<"message" | "confirm" | "form" | "progress">();
	const [message, setMessage] = React.useState<{ message: string; handleClose: () => void }>();
	const [confirm, setConfirm] = React.useState<{ message: string; handleClose: (ok: boolean) => void }>();
	const [form, setForm] = React.useState<{
		title?: string;
		schema: JsonFormSchema;
		data: JsonFormData;
		handleClose: (data?: JsonFormData) => void;
	}>();
	const [progress, setProgress] = React.useState<{
		title: string;
		indeterminate: boolean;
		value: number;
		label: string;
	}>();

	const loadData = async () => {
		console.log(`Loading instance infos for ${instanceId}...`);
		const info = await socket.sendTo(instanceId, "dm:instanceInfo");
		if (!info || typeof info !== "object" || (info as any).apiVersion !== "v1") {
			throw new Error(
				`Message returned from sendTo() doesn't look like one from DeviceManagement, did you accidentally handle the message in your adapter? ${JSON.stringify(
					info,
				)}`,
			);
		}
		setInstanceDetails(info as any as InstanceDetails);
		console.log(`Loading devices for ${instanceId}...`);
		const devices = await socket.sendTo(instanceId, "dm:listDevices");
		if (!devices || !Array.isArray(devices)) {
			throw new Error(
				`Message returned from sendTo() doesn't look like one from DeviceManagement, did you accidentally handle the message in your adapter? ${JSON.stringify(
					devices,
				)}`,
			);
		}
		console.log("listDevices", { result: devices });
		setDevices(devices as any as DeviceInfo[]);
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
			setShowSpinner(true);
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
				case "progress":
					if (openDialog === "progress") {
						setProgress((old) => ({ ...old, ...response.progress }));
					} else {
						setProgress(response.progress);
					}
					setOpenDialog(response.progress?.open ? "progress" : undefined);
					sendActionToInstance("dm:actionProgress", { origin: response.origin });
					break;
				case "result":
					if (response.result.refresh === true || response.result.refresh === "instance") {
						setDevices([]);
						await loadData();
					} else if (response.result.refresh === "device") {
						if (refresh) {
							refresh();
						}
					} else {
						console.log("Not refreshing anything");
					}
					setShowSpinner(false);
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
		loadData().catch(console.error);
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
					{!!instanceDetails?.actions?.length && (
						<div>
							<ButtonGroup size="small" sx={{ height: 36 }}>
								{instanceDetails.actions.map((a) => (
									<InstanceActionButton key={a.id} action={a} context={actionContext} />
								))}
							</ButtonGroup>
						</div>
					)}
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
			<Backdrop open={showSpinner}>{!openDialog && <CircularProgress></CircularProgress>}</Backdrop>
			<Dialog
				open={openDialog === "message"}
				onClose={() => message?.handleClose()}
				hideBackdrop={true}
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
				hideBackdrop={true}
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
			<Dialog open={openDialog === "form"} onClose={() => form?.handleClose()} hideBackdrop={true}>
				<DialogTitle>{form?.title}</DialogTitle>
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
			<Dialog open={openDialog === "progress"} hideBackdrop={true}>
				<DialogTitle>{progress?.title}</DialogTitle>
				<DialogContent>
					<Box sx={{ display: "flex", alignItems: "center", minWidth: 300 }}>
						<Box sx={{ width: "100%", mr: 1 }}>
							<LinearProgress
								variant={progress?.indeterminate ? "indeterminate" : "determinate"}
								value={progress?.value || 0}
							/>
						</Box>
						{!!progress?.label && (
							<Box sx={{ minWidth: 35 }}>
								<Typography variant="body2" color="text.secondary">
									{progress?.label}
								</Typography>
							</Box>
						)}
					</Box>
				</DialogContent>
			</Dialog>
		</>
	);
}
