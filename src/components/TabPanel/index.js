import React from "react";

const TabPanel = ({ children, value, name, keepMounted = false, ...rest }) => {
	const isActive = value === name;
	
	if (!isActive && !keepMounted) {
		return null;
	}

	return (
		<div
			role="tabpanel"
			id={`simple-tabpanel-${name}`}
			aria-labelledby={`simple-tab-${name}`}
			style={{ display: isActive ? 'block' : 'none' }}
			{...rest}
		>
			<>{children}</>
		</div>
	);
};

export default TabPanel;
