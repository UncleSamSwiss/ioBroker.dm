import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";

import ConfigGeneric from "./ConfigGeneric";
import I18n from "@iobroker/adapter-react/i18n";

import React from "react"; // [SW]

const styles = (theme) => ({
	error: {
		color: "red",
	},
});

class ConfigCheckbox extends ConfigGeneric {
	renderItem(error, disabled) {
		const value = ConfigGeneric.getValue(this.props.data, this.props.attr);
		let isIndeterminate = Array.isArray(value);

		return (
			<FormControl className={this.props.classes.fullWidth}>
				<FormControlLabel
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						this.onChange(this.props.attr, !value);
					}}
					control={
						<Checkbox
							indeterminate={isIndeterminate}
							checked={!!value}
							onChange={(e) => {
								if (isIndeterminate) {
									this.onChange(this.props.attr, true);
								} else {
									this.onChange(this.props.attr, e.target.checked);
								}
							}}
							disabled={!!disabled}
						/>
					}
					label={this.getText(this.props.schema.label)}
				/>
				<FormHelperText className={this.props.classes.error}>
					{error
						? this.props.schema.validatorErrorText
							? I18n.t(this.props.schema.validatorErrorText)
							: I18n.t("Error")
						: null}
				</FormHelperText>
				{this.props.schema.help ? (
					<FormHelperText>
						{this.renderHelp(
							this.props.schema.help,
							this.props.schema.helpLink,
							this.props.schema.noTranslation,
						)}
					</FormHelperText>
				) : null}
			</FormControl>
		);
	}
}

ConfigCheckbox.propTypes = {
	socket: PropTypes.object.isRequired,
	themeType: PropTypes.string,
	themeName: PropTypes.string,
	style: PropTypes.object,
	className: PropTypes.string,
	data: PropTypes.object.isRequired,
	schema: PropTypes.object,
	onError: PropTypes.func,
	onChange: PropTypes.func,
};

export default withStyles(styles)(ConfigCheckbox);
