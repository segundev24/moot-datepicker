import React from "react";

import { ChevronDownIcon, CloseIcon } from "./utils";

interface ToggleButtonProps {
    isEmpty: boolean;
    isDatePickerOpen: boolean;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isDatePickerOpen }): JSX.Element => {
    return isDatePickerOpen ? (
        <CloseIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    ) : (
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    );
};

export default ToggleButton;
