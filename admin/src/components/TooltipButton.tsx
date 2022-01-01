import React, { FC, ReactElement } from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ToggleButton from "@mui/material/ToggleButton";

export function TooltipButton(
	props: { tooltip: string; toggle?: boolean; disabled?: boolean; Icon: ReactElement } & ButtonProps,
) {
	const { tooltip, toggle, disabled, Icon, ...other } = props;
	const Btn: FC<any> = toggle ? ToggleButton : Button;
	//const Btn = ToggleButton;
	return !!disabled ? (
		<Btn disabled={true} {...other}>
			{Icon}
		</Btn>
	) : (
		<Tooltip title={tooltip}>
			<Btn {...other}>{Icon}</Btn>
		</Tooltip>
	);
}
