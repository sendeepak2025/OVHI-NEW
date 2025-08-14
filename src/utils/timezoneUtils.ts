import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";

export const EST_TIMEZONE = "America/New_York";
export const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Convert IST date/time to EST
 */
export const convertISTToEST = (date: Date, timeString: string): Date => {
  const [hours, minutes] = timeString.split(":").map(Number);
  
  // Create date in IST timezone
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Create the datetime in IST
  const istDateTime = new Date(year, month, day, hours, minutes, 0, 0);
  
  console.log("IST DateTime:", istDateTime);
  
  // Convert IST to EST using date-fns-tz
  const estDateTime = fromZonedTime(istDateTime, IST_TIMEZONE);
  
  console.log("EST DateTime:", estDateTime);
  
  return istDateTime;
};

/**
 * Convert EST date to IST for display
 */
export const convertESTToIST = (estDateString: string): Date => {
  // Parse the EST date
  const estDate = new Date(estDateString + (estDateString.includes('T') ? '' : 'T00:00:00'));
  
  // Convert EST to IST
  const istDate = toZonedTime(estDate, EST_TIMEZONE);
  
  return istDate;
};

/**
 * Format date for API (EST timezone)
 */
export const formatDateForAPI = (estDate: Date): string => {
  const year = estDate.getFullYear();
  const month = String(estDate.getMonth() + 1).padStart(2, '0');
  const day = String(estDate.getDate()).padStart(2, '0');
  const hours = String(estDate.getHours()).padStart(2, '0');
  const minutes = String(estDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
};

/**
 * Get display time in IST
 */
export const getDisplayTime = (date: Date): string => {
  return formatInTimeZone(date, IST_TIMEZONE, 'HH:mm');
};

/**
 * Get display date in IST
 */
export const getDisplayDate = (date: Date): string => {
  return formatInTimeZone(date, IST_TIMEZONE, 'yyyy-MM-dd');
};
