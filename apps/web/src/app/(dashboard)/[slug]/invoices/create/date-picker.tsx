"use client"

import { Button, Calendar, CalendarIcon, Popover } from "@freelii/ui"
import { cn } from "@freelii/utils"
import dayjs from "dayjs"
import * as React from "react"

export function DatePicker({ date, setDate }: { date: Date | undefined, setDate: (date: Date | undefined) => void }) {
    const [openPopover, setOpenPopover] = React.useState(false)

    return (
        <Popover
            content={
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => setDate(date)}
                    initialFocus
                />}
            openPopover={openPopover}
            setOpenPopover={setOpenPopover}
            align="start"
            side="bottom">
            <Button
                variant={"outline"}
                className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                )}
            >
                <CalendarIcon />
                {date ? dayjs(date).format("MMM D, YYYY") : <span>Pick a date</span>}
            </Button>
        </Popover>
    )
}
