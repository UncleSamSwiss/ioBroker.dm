export type DeviceStatus =
	| "connected"
	| "disconnected"
	| {
			/**
			 * This can either be the name of a font awesome icon (e.g. "fa-signal") or the URL to an icon.
			 */
			icon: string;
			description?: ioBroker.StringOrTranslated;
	  };

export interface ActionBase {
	id: string;
	/**
	 * This can either be the name of a font awesome icon (e.g. "fa-signal") or the URL to an icon.
	 */
	icon: string;
	description?: ioBroker.StringOrTranslated;
	disabled?: boolean;
}

export interface InstanceAction extends ActionBase {
	title: string;
}

export type DeviceAction = ActionBase;

export type ApiVersion = "v1";

export interface InstanceDetails {
	apiVersion: ApiVersion;
	actions?: InstanceAction[];
}

export interface DeviceInfo {
	id: string;
	name: ioBroker.StringOrTranslated;
	status?: DeviceStatus;
	actions?: DeviceAction[];
	hasDetails?: boolean;
}

export type DeviceRefresh = "device" | "instance" | false;

export type JsonFormSchema = Record<string, any>;

export type JsonFormData = Record<string, any>;

export interface DeviceDetails {
	id: string;
	schema: JsonFormSchema;
	data?: JsonFormData;
}
