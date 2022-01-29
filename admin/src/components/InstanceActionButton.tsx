import React from "react";
import { InstanceAction } from "../types";
import { ActionContext } from "./DeviceList";
import { FaOrImageIcon } from "./FaOrImgIcon";
import { TooltipButton } from "./TooltipButton";

export function InstanceActionButton(props: { action: InstanceAction; context: ActionContext }) {
	const { action, context } = props;

	const tooltip = context.getTranslation(action.description);

	return (
		<TooltipButton
			tooltip={tooltip}
			label={action.title}
			disabled={action.disabled}
			Icon={<FaOrImageIcon icon={action.icon} />}
			onClick={context.instanceHandler(action)}
		/>
	);
}
