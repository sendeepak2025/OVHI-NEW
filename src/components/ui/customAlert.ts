import Swal, { SweetAlertOptions } from "sweetalert2";
import "animate.css"; // Ensure Animate.css is imported for animations

/**
 * Base configuration for all SweetAlert2 toast notifications.
 * These settings define the common look and behavior of our toasts.
 */
const toastBaseConfig: SweetAlertOptions = {
  toast: true, // Make it a toast (small, non-blocking notification)
  position: "top-end", // Position toast at the top-right corner
  showConfirmButton: false, // No confirm button by default
  timer: 3000, // Automatically close after 3 seconds
  timerProgressBar: true, // Show a progress bar as the timer counts down
  background: "#ffffff", // White background for the toast
  color: "#1f2937", // Dark gray text color
  customClass: {
    popup: "shadow-md rounded-md px-4 py-3 border border-gray-200", // Custom styling for the toast container
    title: "text-sm font-medium text-gray-800", // Styling for the title text
    htmlContainer: "text-sm text-gray-600", // Styling for the main content HTML
  },
  showClass: {
    popup: "animate__animated animate__fadeInRight", // Animation when toast appears
  },
  hideClass: {
    popup: "animate__animated animate__fadeOutRight", // Animation when toast disappears
  },
};

/**
 * Displays a success toast notification.
 * Uses SweetAlert2's built-in 'success' icon.
 * @param title The title of the success message (defaults to "Success!").
 * @param text Optional, detailed text content to display below the title.
 */
export function showSuccess(title: string = "Success!", text: string = ""): void {
  Swal.fire({
    title, // Title is now just the string, SweetAlert2 adds the icon
    html: text,
    icon: "success", // Use SweetAlert2's built-in success icon
    ...toastBaseConfig,
  });
}

/**
 * Displays an error toast notification.
 * Uses SweetAlert2's built-in 'error' icon.
 * @param title The title of the error message (defaults to "Error!").
 * @param text Optional, detailed text content to display below the title.
 */
export function showError(title: string = "Error!", text: string = ""): void {
  Swal.fire({
    title, // Title is now just the string, SweetAlert2 adds the icon
    html: text,
    icon: "error", // Use SweetAlert2's built-in error icon
    ...toastBaseConfig,
  });
}

/**
 * Displays a loading toast notification.
 * This toast will not auto-close and requires `closeAlert()` to be called manually.
 * Uses SweetAlert2's built-in 'info' icon and its native loading spinner.
 * @param message The message to display alongside the loading spinner (defaults to "Please wait...").
 */
export function showLoadingToast(message: string = "Please wait..."): void {
  Swal.fire({
    title: message, // Title is now just the string, SweetAlert2 adds the icon
    icon: "info", // Use SweetAlert2's built-in info icon
    ...toastBaseConfig,
    timer: undefined, // Disable timer for loading toast, it needs to be manually closed
    showConfirmButton: false, // Ensure no confirm button is shown
    didOpen: () => {
      Swal.showLoading(); // Show SweetAlert's built-in loading spinner
    },
    allowOutsideClick: false, // Prevent closing by clicking outside
    allowEscapeKey: false, // Prevent closing by pressing Escape key
  });
}

/**
 * Closes any currently open SweetAlert2 notification.
 * Useful for programmatically dismissing toasts, especially loading ones.
 */
export function closeAlert(): void {
  Swal.close();
}