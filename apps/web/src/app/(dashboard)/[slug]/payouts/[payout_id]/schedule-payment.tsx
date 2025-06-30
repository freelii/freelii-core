"use client"

import { Button, Separator } from "@freelii/ui"
import { cn } from "@freelii/utils"
import { Calendar, Clock, X } from "lucide-react"
import { useState } from "react"

interface SchedulePaymentProps {
  onSchedule: (scheduledDate: Date) => void
  onCancel: () => void
  isScheduling?: boolean
}

export function SchedulePayment({ onSchedule, onCancel, isScheduling = false }: SchedulePaymentProps) {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")

  // Generate date options for the next 30 days
  const dateOptions = []
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dateOptions.push({
      value: date.toISOString().split('T')[0],
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    })
  }

  // Generate time options (hourly intervals)
  const timeOptions = []
  for (let hour = 0; hour < 24; hour++) {
    const time12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const ampm = hour < 12 ? 'AM' : 'PM'
    const timeValue = `${hour.toString().padStart(2, '0')}:00`
    const timeLabel = `${time12}:00 ${ampm}`
    timeOptions.push({ value: timeValue, label: timeLabel })
  }

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) return
    
    const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`)
    onSchedule(scheduledDateTime)
  }

  const isValidSchedule = selectedDate && selectedTime

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Schedule Payment</h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose when you want this payment to be sent
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="size-8 p-0"
        >
          <X className="size-4" />
        </Button>
      </div>

      <Separator />

      {/* Date Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-gray-500" />
          <label className="text-sm font-medium">Select Date</label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {dateOptions.slice(0, 6).map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedDate(option.value)}
              className={cn(
                "p-3 text-sm rounded-lg border transition-colors text-left",
                selectedDate === option.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {/* Custom date input for dates beyond the quick options */}
        <div className="pt-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={today.toISOString().split('T')[0]}
            className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Time Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-gray-500" />
          <label className="text-sm font-medium">Select Time</label>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {timeOptions.filter((_, index) => index % 2 === 0).slice(0, 12).map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedTime(option.value)}
              className={cn(
                "p-2 text-sm rounded-lg border transition-colors",
                selectedTime === option.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {/* Custom time input */}
        <div className="pt-2">
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Schedule Summary */}
      {isValidSchedule && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
              <Clock className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Payment Scheduled</p>
              <p className="text-sm text-blue-700 mt-1">
                This payment will be automatically sent on{" "}
                <strong>
                  {new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}{" "}
                  at{" "}
                  {new Date(`${selectedDate}T${selectedTime}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSchedule}
          disabled={!isValidSchedule || isScheduling}
          className="min-w-[120px]"
        >
          {isScheduling ? "Scheduling..." : "Schedule Payment"}
        </Button>
      </div>
    </div>
  )
}