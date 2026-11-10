import { TaskManagementModal } from "@/src/presentation/components/task/TaskManagementModal";
import { Task } from "@/src/domain";

interface TaskExportModalProps {
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskExportModal(props: TaskExportModalProps) {
  return (
    <TaskManagementModal
      tasks={props.tasks}
      open={props.open}
      defaultMode="export"
      onOpenChange={props.onOpenChange}
      onImportTasks={() => {}}
    />
  );
}
