import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { uz as uzLocale } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateInputProps {
    date?: Date;
    setDate: (date?: Date) => void;
    placeholder?: string;
    className?: string;
}

export function DateInput({ date, setDate, placeholder = "Sana tanlang", className }: DateInputProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                        "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        "transition-colors duration-200",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <span className="truncate">
                        {date ? format(date, "dd.MM.yyyy") : placeholder}
                    </span>
                    <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                        setDate(d)
                        setOpen(false)
                    }}
                    initialFocus
                    locale={uzLocale}
                />
            </PopoverContent>
        </Popover>
    )
}
