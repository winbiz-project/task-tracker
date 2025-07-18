
"use client";

import * as React from "react";
import { format, formatDistanceToNow, isSameDay } from "date-fns";
import type { Task, TaskStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TaskActions } from "@/components/task-actions";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

interface TaskTableProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onViewHistory: (task: Task) => void;
  onUpdateTask: (taskId: string, updatedFields: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>) => void;
}

type EditableField = 'taskName' | 'PIC' | 'progress';
type SortableField = keyof Omit<Task, 'id' | 'userId' | 'description'>;

type EditingCell = {
  taskId: string;
  field: EditableField;
} | null;

const statusOptions: TaskStatus[] = ["On-going", "Hold", "Done"];

export function TaskTable({
  tasks,
  onEditTask,
  onDeleteTask,
  onViewHistory,
  onUpdateTask,
}: TaskTableProps) {
  const [editingCell, setEditingCell] = React.useState<EditingCell>(null);
  const [editValue, setEditValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Sorting state
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableField; direction: 'ascending' | 'descending' } | null>({ key: 'createdAt', direction: 'descending' });

  // Filtering state
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [picFilter, setPicFilter] = React.useState<string>("");
  const [dateFilter, setDateFilter] = React.useState<Date | undefined>(undefined);

  React.useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);
  
  const filteredAndSortedTasks = React.useMemo(() => {
    let processableTasks = [...tasks];

    // Apply search
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        processableTasks = processableTasks.filter(task => 
            task.taskName.toLowerCase().includes(lowercasedQuery) ||
            (task.description && task.description.toLowerCase().includes(lowercasedQuery)) ||
            (task.progress && task.progress.toLowerCase().includes(lowercasedQuery))
        );
    }

    // Apply filters
    if (statusFilter !== "All") {
      processableTasks = processableTasks.filter(task => task.status === statusFilter);
    }
    if (picFilter) {
      processableTasks = processableTasks.filter(task => task.PIC.toLowerCase().includes(picFilter.toLowerCase()));
    }
    if (dateFilter) {
      processableTasks = processableTasks.filter(task => isSameDay(task.createdAt, dateFilter));
    }

    // Apply sorting
    if (sortConfig !== null) {
      processableTasks.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
  
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
  
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return processableTasks;
  }, [tasks, sortConfig, searchQuery, statusFilter, picFilter, dateFilter]);

  const requestSort = (key: SortableField) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortableField) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  const getStatusBadgeVariant = (status: Task["status"]) => {
    switch (status) {
      case "Done":
        return "default";
      case "On-going":
        return "secondary";
      case "Hold":
        return "outline";
      default:
        return "default";
    }
  };

  const handleCellClick = (task: Task, field: EditableField) => {
    setEditingCell({ taskId: task.id, field });
    setEditValue(task[field] as string || "");
  };

  const handleSaveEdit = () => {
    if (editingCell) {
      onUpdateTask(editingCell.taskId, { [editingCell.field]: editValue });
      setEditingCell(null);
      setEditValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const renderEditableCell = (task: Task, field: EditableField) => {
    if (editingCell?.taskId === task.id && editingCell?.field === field) {
      return (
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          className="h-8"
        />
      );
    }
    return (
      <div onClick={() => handleCellClick(task, field)} className="cursor-pointer min-h-[2rem] flex items-center max-w-xs truncate">
        {task[field] || "-"}
      </div>
    );
  };


  if (tasks.length === 0) {
    return (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="flex flex-col items-center gap-2">
                <h2 className="font-headline text-2xl font-semibold">No tasks found</h2>
                <p className="text-muted-foreground">Click "New Task" to get started.</p>
            </div>
        </div>
    )
  }

  const renderHeader = (label: string, key: SortableField) => (
      <TableHead>
          <Button variant="ghost" onClick={() => requestSort(key)} className="-ml-4">
              {label}
              {getSortIndicator(key)}
          </Button>
      </TableHead>
  );

  return (
    <div className="space-y-4">
       <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
              />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:flex-initial md:w-auto md:grid-cols-3">
              <Input
                  placeholder="Filter by PIC..."
                  value={picFilter}
                  onChange={(e) => setPicFilter(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                      <SelectValue placeholder="Filter by status..." />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      {statusOptions.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              <DatePicker date={dateFilter} setDate={setDateFilter} />
          </div>
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {renderHeader('Task Name', 'taskName')}
              {renderHeader('Status', 'status')}
              {renderHeader('PIC', 'PIC')}
              {renderHeader('Progress', 'progress')}
              {renderHeader('Created', 'createdAt')}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  {renderEditableCell(task, 'taskName')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Badge variant={getStatusBadgeVariant(task.status)} className="cursor-pointer">
                         {task.status}
                       </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {statusOptions.map(status => (
                        <DropdownMenuItem 
                          key={status}
                          onClick={() => onUpdateTask(task.id, { status: status })}
                          disabled={task.status === status}
                        >
                          {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>{renderEditableCell(task, 'PIC')}</TableCell>
                <TableCell>
                  {renderEditableCell(task, 'progress')}
                </TableCell>
                <TableCell>
                  {format(task.createdAt, 'dd MMM yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <TaskActions
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onViewHistory={onViewHistory}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {filteredAndSortedTasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>
                <button onClick={() => onViewHistory(task)} className="text-left hover:underline">
                  {task.taskName}
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={getStatusBadgeVariant(task.status)}>
                  {task.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PIC</span>
                <span>{task.PIC}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Progress</span>
                <p className="mt-1">{task.progress || "-"}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <TaskActions
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onViewHistory={onViewHistory}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
