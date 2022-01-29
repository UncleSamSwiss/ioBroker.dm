import React, { FC, ReactElement } from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ToggleButton from "@mui/material/ToggleButton";
import Typography from "@mui/material/Typography";

export function TooltipButton(
	props: { tooltip: string; label?: string; toggle?: boolean; disabled?: boolean; Icon: ReactElement } & ButtonProps,
) {
	const { tooltip, label, toggle, disabled, Icon, ...other } = props;
	const Btn: FC<any> = toggle ? ToggleButton : Button;
	const text = !!label && <Typography variant="button">{label}</Typography>;
	//const Btn = ToggleButton;
	return !!disabled ? (
		<Btn disabled={true} {...other}>
			{Icon} {text}
		</Btn>
	) : (
		<Tooltip title={tooltip}>
			<Btn {...other}>
				{Icon} {text}
			</Btn>
		</Tooltip>
	);
}
