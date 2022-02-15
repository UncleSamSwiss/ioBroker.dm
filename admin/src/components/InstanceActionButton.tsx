import { InstanceAction } from "dm-utils/build/types/api";
import React from "react";
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
