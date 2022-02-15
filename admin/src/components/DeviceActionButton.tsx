import { DeviceAction } from "dm-utils/build/types/api";
import React from "react";
import { ActionContext } from "./DeviceList";
import { FaOrImageIcon } from "./FaOrImgIcon";
import { TooltipButton } from "./TooltipButton";

export function DeviceActionButton(props: {
	deviceId: string;
	action: DeviceAction;
	refresh: () => void;
	context: ActionContext;
}) {
	const { deviceId, action, refresh, context } = props;

	const tooltip = context.getTranslation(action.description);

	return (
		<TooltipButton
			tooltip={tooltip}
			disabled={action.disabled}
			Icon={<FaOrImageIcon icon={action.icon} />}
			onClick={context.deviceHandler(deviceId, action, refresh)}
		/>
	);
}
