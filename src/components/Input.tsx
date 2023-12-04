import dayjs from "dayjs";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";

import { BORDER_COLOR, DATE_FORMAT, RING_COLOR } from "../constants";
import DatepickerContext from "../contexts/DatepickerContext";
import { dateIsValid, parseFormattedDate } from "../helpers";

import ToggleButton from "./ToggleButton";
import { ChevronDownIcon, DateIcon } from "./utils";

type Props = {
    setContextRef?: (ref: React.RefObject<HTMLInputElement>) => void;
};

const Input: React.FC<Props> = (e: Props) => {
    // Context
    const {
        primaryColor,
        period,
        dayHover,
        changeDayHover,
        calendarContainer,
        arrowContainer,
        inputText,
        changeInputText,
        hideDatepicker,
        changeDatepickerValue,
        asSingle,
        placeholder,
        separator,
        disabled,
        inputClassName,
        toggleClassName,
        toggleIcon,
        readOnly,
        displayFormat,
        inputId,
        inputName,
        classNames,
        popoverDirection
    } = useContext(DatepickerContext);

    // UseRefs
    const buttonRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    // Functions
    const getClassName = useCallback(() => {
        const input = inputRef.current;

        if (input && typeof classNames !== "undefined" && typeof classNames?.input === "function") {
            return classNames.input(input);
        }

        const border = BORDER_COLOR.focus[primaryColor as keyof typeof BORDER_COLOR.focus];
        const ring =
            RING_COLOR["second-focus"][primaryColor as keyof (typeof RING_COLOR)["second-focus"]];

        const defaultInputClassName =
            "lg:w-[300px] relative transition-all py-2.5 pl-4 pr-14 w-full border-input text-foreground rounded-md tracking-wide font-medium text-sm placeholder-current focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed";

        // `inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ring-offset-background select-none border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 w-full justify-between text-left lg:w-[300px]`

        return typeof inputClassName === "function"
            ? inputClassName(defaultInputClassName)
            : typeof inputClassName === "string" && inputClassName !== ""
            ? inputClassName
            : defaultInputClassName;
    }, [inputRef, classNames, primaryColor, inputClassName]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            const dates = [];

            if (asSingle) {
                const date = parseFormattedDate(inputValue, displayFormat);
                if (dateIsValid(date.toDate())) {
                    dates.push(date.format(DATE_FORMAT));
                }
            } else {
                const parsed = inputValue.split(separator);

                let startDate = null;
                let endDate = null;

                if (parsed.length === 2) {
                    startDate = parseFormattedDate(parsed[0], displayFormat);
                    endDate = parseFormattedDate(parsed[1], displayFormat);
                } else {
                    const middle = Math.floor(inputValue.length / 2);
                    startDate = parseFormattedDate(inputValue.slice(0, middle), displayFormat);
                    endDate = parseFormattedDate(inputValue.slice(middle), displayFormat);
                }

                if (
                    dateIsValid(startDate.toDate()) &&
                    dateIsValid(endDate.toDate()) &&
                    startDate.isBefore(endDate)
                ) {
                    dates.push(startDate.format(DATE_FORMAT));
                    dates.push(endDate.format(DATE_FORMAT));
                }
            }

            if (dates[0]) {
                changeDatepickerValue(
                    {
                        startDate: dates[0],
                        endDate: dates[1] || dates[0]
                    },
                    e.target
                );
                if (dates[1]) changeDayHover(dayjs(dates[1]).add(-1, "day").format(DATE_FORMAT));
                else changeDayHover(dates[0]);
            }

            changeInputText(e.target.value);
        },
        [asSingle, displayFormat, separator, changeDatepickerValue, changeDayHover, changeInputText]
    );

    const handleInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                const input = inputRef.current;
                if (input) {
                    input.blur();
                }
                hideDatepicker();
            }
        },
        [hideDatepicker]
    );

    const renderToggleIcon = useCallback(
        (isEmpty: boolean) => {
            return typeof toggleIcon === "undefined" ? (
                <ToggleButton isEmpty={isEmpty} isDatePickerOpen={isDatePickerOpen} />
            ) : (
                toggleIcon(isEmpty)
            );
        },
        [toggleIcon]
    );

    const getToggleClassName = useCallback(() => {
        const button = buttonRef.current;

        if (
            button &&
            typeof classNames !== "undefined" &&
            typeof classNames?.toggleButton === "function"
        ) {
            return classNames.toggleButton(button);
        }

        const defaultToggleClassName =
            "z-30 absolute right-0 h-full px-3 text-current focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed";

        return typeof toggleClassName === "function"
            ? toggleClassName(defaultToggleClassName)
            : typeof toggleClassName === "string" && toggleClassName !== ""
            ? toggleClassName
            : defaultToggleClassName;
    }, [toggleClassName, buttonRef, classNames]);

    // UseEffects && UseLayoutEffect
    useEffect(() => {
        if (inputRef && e.setContextRef && typeof e.setContextRef === "function") {
            e.setContextRef(inputRef);
        }
    }, [e, inputRef]);

    useEffect(() => {
        const button = buttonRef?.current;

        function focusInput(e: Event) {
            e.stopPropagation();
            const input = inputRef.current;

            if (input) {
                input.focus();
                if (inputText) {
                    // changeInputText("");
                    if (dayHover) {
                        changeDayHover(null);
                    }
                    if (period.start && period.end) {
                        changeDatepickerValue(
                            {
                                startDate: null,
                                endDate: null
                            },
                            input
                        );
                        // hideDatepicker();
                    }
                }
            }
        }

        if (button) {
            button.addEventListener("click", focusInput);
        }

        return () => {
            if (button) {
                button.removeEventListener("click", focusInput);
            }
        };
    }, [
        changeDatepickerValue,
        changeDayHover,
        changeInputText,
        dayHover,
        inputText,
        period.end,
        period.start,
        inputRef
    ]);

    useEffect(() => {
        const div = calendarContainer?.current;
        const arrow = arrowContainer?.current;

        if (isDatePickerOpen && div && arrow) {
            // Remove 'hidden' and add 'block' to display the calendar
            div.classList.remove("hidden");
            div.classList.add("block");

            // Positioning logic for the popover
            const popoverOnUp = popoverDirection === "up";
            const popoverOnDown = popoverDirection === "down";

            if (
                popoverOnUp ||
                (window.innerWidth > 767 &&
                    window.screen.height - 100 < div.getBoundingClientRect().bottom &&
                    !popoverOnDown)
            ) {
                div.classList.add("bottom-full");
                div.classList.add("mb-2.5");
                div.classList.remove("mt-2.5");
                arrow.classList.add("-bottom-2");
                arrow.classList.add("border-r");
                arrow.classList.add("border-b");
                arrow.classList.remove("border-l");
                arrow.classList.remove("border-t");
            } else {
                // Reset classes if the popover is not 'up'
                div.classList.remove("bottom-full", "mb-2.5");
                div.classList.add("mt-2.5");
                arrow.classList.remove("-bottom-2", "border-r", "border-b");
                arrow.classList.add("border-l", "border-t");
            }

            // Animation for smooth appearance
            setTimeout(() => {
                div.classList.remove("translate-y-4", "opacity-0");
                div.classList.add("translate-y-0", "opacity-1");
            }, 1);
        } else if (div) {
            // Add 'hidden' and remove 'block' to hide the calendar
            div.classList.add("hidden");
            div.classList.remove("block");
            // Reset positioning and animation classes
            div.classList.remove("bottom-full", "mb-2.5", "mt-2.5", "translate-y-0", "opacity-1");
            div.classList.add("translate-y-4", "opacity-0");
            arrow?.classList.remove("-bottom-2", "border-r", "border-b", "border-l", "border-t");
        }
    }, [isDatePickerOpen, calendarContainer, arrowContainer, popoverDirection]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const div = calendarContainer?.current;
            const input = inputRef.current;

            // Check if the target is a DOM element
            if (event.target instanceof HTMLElement) {
                if (div && !div.contains(event.target) && input && !input.contains(event.target)) {
                    setIsDatePickerOpen(false);
                }
            }
        };

        // Attach the event listener to the document
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            // Clean up the event listener
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [calendarContainer, inputRef]); // Dependencies for the useEffect

    const toggleDatepicker = () => {
        if (isDatePickerOpen) {
            setIsDatePickerOpen(false);
            // hideDatepicker();
        } else {
            setIsDatePickerOpen(true);
        }
    };

    return (
        <div className="relative">
            <DateIcon className="z-30 absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground" />

            <input
                ref={inputRef}
                type="text"
                className={`pl-9 cursor-pointer hover:bg-accent text-foreground bg-transparent pr-2 ${getClassName()} border rounded-md`} // Adjust padding to make room for the icon
                disabled={disabled}
                readOnly={readOnly}
                placeholder={
                    placeholder
                        ? placeholder
                        : `${displayFormat}${asSingle ? "" : ` ${separator} ${displayFormat}`}`
                }
                value={inputText}
                id={inputId}
                name={inputName}
                autoComplete="off"
                role="presentation"
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onClick={toggleDatepicker}
            />

            <button
                type="button"
                // ref={buttonRef}
                disabled={disabled}
                className={getToggleClassName()}
                onClick={toggleDatepicker}
            >
                {isDatePickerOpen ? (
                    <ChevronDownIcon className="h-[14px] w-[14px] shrink-0 text-muted-foreground transition-transform duration-200 rotate-180" />
                ) : (
                    <ChevronDownIcon className="h-[14px] w-[14px] shrink-0 text-muted-foreground transition-transform duration-200" />
                )}
            </button>
        </div>
    );
};

export default Input;
