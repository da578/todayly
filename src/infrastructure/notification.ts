import { Task } from "@/src/domain";
import { formatDayTime } from "@/src/services";

/**
 * Browser native notification service.
 *
 * # Traceability
 * - Implementation: `// @impl:FR-NOTIF-01`
 */
// Set to track task IDs that have already triggered a notification in this session
const notifiedTaskIds = new Set<number>();

/**
 * Request native browser notification permission.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications.");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Check for tasks that have missed their deadline and send a native browser notification.
 */
export function checkAndNotifyMissedDeadlines(tasks: Task[]): void {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }
  if (Notification.permission !== "granted") {
    return;
  }

  const now = Date.now();

  tasks.forEach((task) => {
    if (task.status || !task.deadline) return;

    const deadlineTime = new Date(task.deadline).getTime();
    if (isNaN(deadlineTime) || deadlineTime > now) return;

    if (notifiedTaskIds.has(task.id)) return;

    notifiedTaskIds.add(task.id);
    try {
      const n = new Notification(`⏰ Deadline Terlewat: ${task.name}`, {
        body: `Deadline untuk task "${task.name}" telah terlewat pada ${formatDayTime(task.deadline)}. Silakan periksa to-do list Anda.`,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `task-deadline-${task.id}`,
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) {
      console.error("Failed to display native notification", e);
    }
  });
}
