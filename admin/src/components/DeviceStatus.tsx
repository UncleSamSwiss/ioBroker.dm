import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import Tooltip from "@mui/material/Tooltip";
import { DeviceStatus } from "dm-utils";
import * as React from "react";
import { FaOrImageIcon } from "./FaOrImgIcon";

export function DeviceStatus(props: { status?: DeviceStatus }) {
	const { status } = props;
	if (!status) {
		return null;
	}

	if (typeof status === "string") {
		switch (status) {
			case "connected":
				return (
					<Tooltip title="Connected">
						<LinkIcon />
					</Tooltip>
				);
			case "disconnected":
				return (
					<Tooltip title="Disconnected">
						<LinkOffIcon />
					</Tooltip>
				);
			default:
				return null;
		}
	}
	return (
		<Tooltip title={status.description || false}>
			<FaOrImageIcon icon={status.icon} />
		</Tooltip>
	);
}
