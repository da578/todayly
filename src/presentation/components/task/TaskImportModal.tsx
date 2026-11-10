import { TaskManagementModal } from "@/src/presentation/components/task/TaskManagementModal";
import { Task } from "@/src/domain";

interface TaskImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportTasks: (tasks: Task[], mode: "append" | "replace") => void;
}

export function TaskImportModal(props: TaskImportModalProps) {
  return (
    <TaskManagementModal
      tasks={[]}
      open={props.open}
      defaultMode="import"
      onOpenChange={props.onOpenChange}
      onImportTasks={props.onImportTasks}
    />
  );
}
