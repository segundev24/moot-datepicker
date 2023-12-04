import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
dayjs.extend(quarterOfYear);

import { formatDate, previousMonth } from "../helpers";
import { ShortcutsItem } from "../types";

const getQuarterStartEnd = (date: dayjs.Dayjs) => {
    const quarter = date.quarter();
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;

    const start = dayjs().month(startMonth).startOf("month");
    const end = dayjs().month(endMonth).endOf("month");

    return { start, end };
};

const currentQuarterPeriod = getQuarterStartEnd(dayjs());

const DEFAULT_SHORTCUTS: {
    [key in string]: ShortcutsItem | ShortcutsItem[];
} = {
    today: {
        text: "Today",
        period: {
            start: formatDate(dayjs()),
            end: formatDate(dayjs())
        }
    },
    yesterday: {
        text: "Yesterday",
        period: {
            start: formatDate(dayjs().subtract(1, "d")),
            end: formatDate(dayjs().subtract(1, "d"))
        }
    },
    past: [
        {
            daysNumber: 7,
            text: "Last 7 days",
            period: {
                start: formatDate(dayjs().subtract(7, "d")),
                end: formatDate(dayjs())
            }
        },
        {
            daysNumber: 30,
            text: "Last 30 days",
            period: {
                start: formatDate(dayjs().subtract(30, "d")),
                end: formatDate(dayjs())
            }
        },

        {
            daysNumber: 90,
            text: "Last 90 days",
            period: {
                start: formatDate(dayjs().subtract(90, "d")),
                end: formatDate(dayjs())
            }
        }
    ],

    pastMonth: {
        text: "Last month",
        period: {
            start: formatDate(previousMonth(dayjs()).startOf("month")),
            end: formatDate(previousMonth(dayjs()).endOf("month"))
        }
    },
    currentMonth: {
        text: "Month to date",
        period: {
            start: formatDate(dayjs().startOf("month")),
            end: formatDate(dayjs().endOf("month"))
        }
    },
    currentQuarter: {
        text: "Quarter to date",
        period: {
            start: formatDate(currentQuarterPeriod.start),
            end: formatDate(currentQuarterPeriod.end)
        }
    }
};

export default DEFAULT_SHORTCUTS;
