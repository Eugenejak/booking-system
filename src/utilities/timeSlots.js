export const createTimeSlots = (startHour = 8, endHour = 23, excludeLastHour = false) => {
    const slots = Array.from({ length: endHour - startHour + 1 }, (_, i) => {
        const hour = i + startHour;
        return `${String(hour).padStart(2, "0")}:00`;
    });
    return excludeLastHour ? slots.slice(0, -1) : slots;
};