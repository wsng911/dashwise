"use client";

/**
 * ============================================================================
 * 编辑ItemsForm - Composable List Management Component
 * ============================================================================
 *
 * A type-safe, composable component system for building flexible list
 * management interfaces with grouping, filtering, bulk operations, and
 * optional drag-and-drop support.
 *
 * ## Architecture
 *
 * ```
 * 编辑ItemsForm (Context Provider + State Management)
 * │
 * ├── ListHeader (Controls Area)
 * │   ├── Modes (Select Dropdown - 编辑/Move)
 * │   └── Tabs (Group Filtering with Dropdown Menu)
 * │       ├── Tab (Individual group tab with rename/delete actions)
 * │       └── 创建GroupAction (Plus icon to add new group)
 * │
 * ├── ListContent (Items Display Container)
 * │   └── ListItemPrototype (Item Row - Repeats for each item)
 * │       ├── Mode Icon (Left: Move/Select icon based on mode)
 * │       ├── Custom Item Content (Passed as children)
 * │       └── Individual操作 (Right: 编辑/删除/Move buttons)
 * │
 * └── Bulk操作Footer (Bottom sticky bar when items selected)
 *     └── BulkItemsSelected操作 (删除/Move/创建 subgroup buttons)
 * ```
 *
 * ## Data Flow
 *
 * 1. Parent provides items array and groupBy field name
 * 2. 编辑ItemsForm computes groups and creates context
 * 3. Child components use use编辑ItemsForm() hook to access state
 * 4. User interactions update context (mode, selected, currentGroup)
 * 5. Components re-render based on context changes
 * 6. Parent provided onUpdate callback receives changed items
 *
 * ## Key Features
 *
 * - **Type-safe**: Generic type support for any item structure (T extends Record<string, any>)
 * - **Composable**: Build UIs by composing small, focused components
 * - **No prop drilling**: All child components access context via use编辑ItemsForm()
 * - **Two modes**: "edit" mode for selection/actions, "move" mode for drag-and-drop
 * - **Grouping**: Filter items by group, optional subgroup support
 * - **Bulk operations**: Select multiple items, perform bulk actions (delete, move, etc)
 * - **Flexible**: Render custom item content via ListItemPrototype children
 *
 * ## Usage Example
 *
 * ```tsx
 * import {
 *   编辑ItemsForm,
 *   ListHeader,
 *   Modes,
 *   Tabs,
 *   Tab,
 *   ListContent,
 *   ListItemPrototype,
 *   Individual操作,
 *   Action,
 *   Bulk操作Footer,
 *   BulkItemsSelected操作,
 *   use编辑ItemsForm,
 * } from "@/components/编辑ItemsForm";
 *
 * export default function ManageFeeds() {
 *   const [feeds, setFeeds] = useState<NewsFeed[]>([]);
 *
 *   return (
 *     <编辑ItemsForm<NewsFeed>
 *       items={feeds}
 *       groupBy="category"
 *       itemKey="feedUrl"
 *       onUpdate={async (items) => {
 *         await saveFeedsToServer(items);
 *       }}
 *     >
 *       <ListHeader>
 *         <Modes editLabel="编辑" moveLabel="Move" />
 *         <Tabs>
 *           {categories.map(cat => (
 *             <Tab key={cat} name={cat} onRename={handleRename} />
 *           ))}
 *         </Tabs>
 *       </ListHeader>
 *
 *       <ListContent>
 *         <FeedsListContent feeds={feeds} />
 *       </ListContent>
 *
 *       <Bulk操作Footer>
 *         <BulkItemsSelected操作 />
 *       </Bulk操作Footer>
 *     </编辑ItemsForm>
 *   );
 * }
 *
 * // Helper component inside ManageFeeds that uses the hook
 * function FeedsListContent({ feeds }: { feeds: NewsFeed[] }) {
 *   const { currentGroup, groupBy, mode } = use编辑ItemsForm<NewsFeed>();
 *
 *   const filtered = feeds.filter(
 *     f => (f[groupBy] ?? "Uncategorized") === currentGroup
 *   );
 *
 *   return (
 *     <>
 *       {filtered.map(feed => (
 *         <ListItemPrototype key={feed.feedUrl} item={feed}>
 *           <div class名称="flex-1">
 *             <div>{feed.name}</div>
 *             <div>{feed.feedUrl}</div>
 *           </div>
 *           {mode === "edit" && (
 *             <Individual操作>
 *               <Action type="edit" onClick={() => edit(feed)} />
 *               <Action type="delete" onClick={() => delete(feed)} />
 *             </Individual操作>
 *           )}
 *         </ListItemPrototype>
 *       ))}
 *     </>
 *   );
 * }
 * ```
 *
 * ============================================================================
 */

import React, { useState, useMemo, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  fa编辑,
  faArrowRight,
  faTrash,
  faCaretDown,
  faArrowsUpDown,
  faFolderPlus,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SingleActionType = "edit" | "delete" | "moveOrder" | "move";
export type BulkActionType = "delete" | "move" | "createSubgroup";
export type 编辑Mode = "edit" | "move";

export interface 编辑ItemsFormContextType<T extends Record<string, any>> {
  // Data
  items: T[];
  groups: string[];
  currentGroup: string | null;
  mode: 编辑Mode;
  selected: Record<string, boolean>;
  editingKey: string | null;
  expandedSubgroups: Record<string, boolean>;
  draggedItemKey: string | null;
  draggedOverItemKey: string | null;
  insertPosition: "before" | "after" | null;

  // Config
  groupBy: keyof T;
  subgroupBy?: keyof T;
  itemKey: keyof T;
  enableSubgroup: boolean;
  moveItems: "always" | "onMoveMode" | boolean;
  single操作: SingleActionType[];
  bulk操作: BulkActionType[];
  iconRounded: boolean;
  enableMoveMode: boolean;

  // 操作
  setMode: (mode: 编辑Mode) => void;
  setCurrentGroup: (group: string | null) => void;
  toggleSelect: (key: string) => void;
  toggleSelectAll: () => void;
  clearSelected: () => void;
  set编辑ingKey: (key: string | null) => void;
  toggleExpandSubgroup: (subgroup: string) => void;

  // Item operations
  updateItems: (items: T[]) => void;
  updateGroups: (groups: string[]) => void;

  // Drag handlers
  handleDragStart: (key: string, e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (key: string, e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (key: string, e: React.DragEvent<HTMLDivElement>) => void;

  // Callbacks
  on编辑Item?: (item: T) => void;
  on删除Item?: (key: string) => void;
  onMoveItemToGroup?: (item: T) => void;
  onBulk删除?: () => void;
  onBulkMove?: () => void;
  onBulk创建Subgroup?: () => void;
}

export interface 编辑ItemsFormProps<T extends Record<string, any>> {
  items: T[];
  groups?: string[];
  groupBy: keyof T;
  subgroupBy?: keyof T;
  itemKey?: keyof T;
  title?: string;
  createNewGroup?: boolean;
  enableSubgroup?: boolean;
  enableMoveMode?: boolean;
  switchBetweenModes?: boolean;
  defaultMode?: 编辑Mode;
  single操作?: SingleActionType[];
  bulk操作?: BulkActionType[];
  moveItems?: "always" | "onMoveMode" | boolean;
  iconRounded?: boolean;
  require确认ation?: boolean;
  initialGroup?: string;

  // Callbacks
  onUpdate?: (items: T[], groups?: string[]) => Promise<void> | void;
  on创建Group?: (name: string) => Promise<void> | void;
  onGroupAction?: (action: "rename" | "delete", group名称: string, payload?: any) => Promise<void> | void;
  on编辑Item?: (item: T, updated?: Partial<T>) => Promise<void> | void;
  on添加Item?: (group名称: string) => Promise<T> | T;

  // Render props
  renderRow?: (item: T, isSelected: boolean, mode: 编辑Mode) => React.ReactNode;
  render添加Item?: (group名称: string, on添加ed: (item: T) => void, on取消: () => void) => React.ReactNode;
  render编辑Item?: (item: T, on保存d: (updated: T) => void, on取消: () => void) => React.ReactNode;

  children?: React.ReactNode;
}

// ============================================================================
// CONTEXT & HOOK
// ============================================================================

const 编辑ItemsFormContext = createContext<编辑ItemsFormContextType<any> | null>(null);

/**
 * Hook to access 编辑ItemsForm context from child components
 * Must be used within an 编辑ItemsForm provider
 */
export const use编辑ItemsForm = <T extends Record<string, any>>(): 编辑ItemsFormContextType<T> => {
  const context = useContext(编辑ItemsFormContext);
  if (!context) {
    throw new Error("use编辑ItemsForm must be used within 编辑ItemsForm component");
  }
  return context as 编辑ItemsFormContextType<T>;
};

// ============================================================================
// MAIN CONTAINER COMPONENT
// ============================================================================

/**
 * 编辑ItemsForm - Main container and context provider
 * Manages state: selected items, mode, current group, etc.
 */
export function 编辑ItemsForm<T extends Record<string, any>>({
  items,
  groups,
  groupBy,
  subgroupBy,
  itemKey = "id" as any,
  title = "编辑 items",
  createNewGroup = false,
  enableSubgroup = false,
  enableMoveMode = true,
  switchBetweenModes = true,
  defaultMode = "edit",
  single操作 = ["edit", "delete", "moveOrder", "move"],
  bulk操作 = ["delete"],
  moveItems = "onMoveMode",
  iconRounded = true,
  require确认ation = false,
  initialGroup,
  onUpdate,
  on创建Group,
  onGroupAction,
  on编辑Item,
  on添加Item,
  renderRow,
  render添加Item,
  render编辑Item,
  children,
}: 编辑ItemsFormProps<T>) {
  // Compute groups if not provided
  const computedGroups = useMemo(() => {
    if (groups) return groups;
    const groupSet = new Set<string>();
    items.forEach((item) => {
      const groupVal = String(item[groupBy] ?? "");
      if (groupVal) groupSet.add(groupVal);
    });
    return Array.from(groupSet);
  }, [items, groups, groupBy]);

  // State
  const [currentGroup, setCurrentGroup] = useState<string | null>(
    () => initialGroup && computedGroups.includes(initialGroup) ? initialGroup : computedGroups[0] ?? null
  );
  const [mode, setMode] = useState<编辑Mode>(defaultMode);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [editingKey, set编辑ingKey] = useState<string | null>(null);
  const [expandedSubgroups, setExpandedSubgroups] = useState<Record<string, boolean>>({});
  const [workingItems, setWorkingItems] = useState<T[]>(items);
  const [workingGroups, setWorkingGroups] = useState<string[]>(computedGroups);
  const [draggedItemKey, setDraggedItemKey] = useState<string | null>(null);
  const [draggedOverItemKey, setDraggedOverItemKey] = useState<string | null>(null);
  const [insertPosition, setInsertPosition] = useState<"before" | "after" | null>(null);

  // Sync with parent props
  useEffect(() => {
    setWorkingItems(items);
  }, [items]);

  useEffect(() => {
    setWorkingGroups(computedGroups);
  }, [computedGroups]);

  // Update currentGroup if it's removed
  useEffect(() => {
    if (currentGroup && !workingGroups.includes(currentGroup) && workingGroups.length > 0) {
      setCurrentGroup(workingGroups[0]);
    }
  }, [workingGroups, currentGroup]);

  const getKeyFor = useCallback((item: T, fallbackIndex?: number) => {
    const v = item[itemKey as keyof T];
    if (v !== undefined && v !== null) return String(v);
    if ((item as any).url) return (item as any).url;
    if ((item as any).name) return (item as any).name;
    return `idx-${fallbackIndex ?? Math.random().toString(36).slice(2, 9)}`;
  }, [itemKey]);

  const toggleSelect = useCallback((key: string) => {
    setSelected((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (!currentGroup) return;
    const itemsInGroup = workingItems.filter((it) => String(it[groupBy] ?? "") === currentGroup);
    const allSelected = itemsInGroup.every((it) => selected[getKeyFor(it)]);

    if (allSelected) {
      const newSelected = { ...selected };
      itemsInGroup.forEach((it) => {
        delete newSelected[getKeyFor(it)];
      });
      setSelected(newSelected);
    } else {
      const newSelected = { ...selected };
      itemsInGroup.forEach((it) => {
        newSelected[getKeyFor(it)] = true;
      });
      setSelected(newSelected);
    }
  }, [currentGroup, workingItems, groupBy, selected, getKeyFor]);

  const clearSelected = useCallback(() => {
    setSelected({});
  }, []);

  const toggleExpandSubgroup = useCallback((subgroup: string) => {
    setExpandedSubgroups((prev) => ({
      ...prev,
      [subgroup]: !prev[subgroup],
    }));
  }, []);

  const handleDragStart = useCallback((key: string, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedItemKey(key);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((key: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!draggedItemKey || draggedItemKey === key) {
      setDraggedOverItemKey(null);
      setInsertPosition(null);
      return;
    }

    setDraggedOverItemKey(key);

    // Determine if should insert before or after based on mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? "before" : "after";
    setInsertPosition(position);
  }, [draggedItemKey]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggedOverItemKey(null);
    setInsertPosition(null);
  }, []);

  const handleDrop = useCallback(
    (key: string, e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!draggedItemKey || draggedItemKey === key) {
        setDraggedItemKey(null);
        setDraggedOverItemKey(null);
        setInsertPosition(null);
        return;
      }

      // Find indices of dragged and target items (only in current group)
      const itemsInGroup = workingItems.filter((it) => String(it[groupBy] ?? "") === currentGroup);
      const draggedIndex = itemsInGroup.findIndex((it) => getKeyFor(it) === draggedItemKey);
      const targetIndex = itemsInGroup.findIndex((it) => getKeyFor(it) === key);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedItemKey(null);
        setDraggedOverItemKey(null);
        setInsertPosition(null);
        return;
      }

      // Calculate new position
      let newIndex = targetIndex;
      if (insertPosition === "after") {
        newIndex = targetIndex + 1;
      }

      // Adjust if dragging backwards
      if (draggedIndex < targetIndex && insertPosition === "after") {
        newIndex = targetIndex + 1;
      } else if (draggedIndex > targetIndex && insertPosition === "before") {
        newIndex = targetIndex;
      } else if (draggedIndex < targetIndex) {
        newIndex = targetIndex;
      }

      // 创建 new items array with reordered items
      const newItems = [...workingItems];
      const draggedItem = itemsInGroup[draggedIndex];
      const otherItems = itemsInGroup.filter((_, i) => i !== draggedIndex);
      const reorderedGroup = [...otherItems.slice(0, newIndex), draggedItem, ...otherItems.slice(newIndex)];

      // Update items: replace the group's items with reordered ones
      const groupItemIndices = newItems
        .map((it, i) => (String(it[groupBy] ?? "") === currentGroup ? i : -1))
        .filter((i) => i !== -1);

      groupItemIndices.forEach((globalIndex, localIndex) => {
        newItems[globalIndex] = reorderedGroup[localIndex];
      });

      setWorkingItems(newItems);

      // Call onUpdate with new items
      if (onUpdate) {
        onUpdate(newItems, workingGroups);
      }

      // Reset drag state
      setDraggedItemKey(null);
      setDraggedOverItemKey(null);
      setInsertPosition(null);
    },
    [draggedItemKey, workingItems, workingGroups, currentGroup, groupBy, getKeyFor, onUpdate]
  );

  const context: 编辑ItemsFormContextType<T> = {
    // Data
    items: workingItems,
    groups: workingGroups,
    currentGroup,
    mode,
    selected,
    editingKey,
    expandedSubgroups,
    draggedItemKey,
    draggedOverItemKey,
    insertPosition,

    // Config
    groupBy,
    subgroupBy,
    itemKey,
    enableSubgroup,
    moveItems,
    single操作,
    bulk操作,
    iconRounded,
    enableMoveMode,

    // 操作
    setMode,
    setCurrentGroup,
    toggleSelect,
    toggleSelectAll,
    clearSelected,
    set编辑ingKey,
    toggleExpandSubgroup,

    // Item operations
    updateItems: setWorkingItems,
    updateGroups: setWorkingGroups,

    // Drag handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,

    // Callbacks
    on编辑Item,
    on删除Item: undefined,
    onMoveItemToGroup: undefined,
    onBulk删除: undefined,
    onBulkMove: undefined,
    onBulk创建Subgroup: undefined,
  };

  return (
    <编辑ItemsFormContext.Provider value={context}>
      <div class名称="edit-items-form space-y-4 relative">
        {children}
      </div>
    </编辑ItemsFormContext.Provider>
  );
}

// ============================================================================
// LIST HEADER COMPONENTS
// ============================================================================

/** Container for header controls (mode select, tabs, etc.) */
export function ListHeader({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modesRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [stackTabs, setStackTabs] = useState(false);

  const childArray = useMemo(
    () => React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement[],
    [children]
  );

  const { modesChild, tabsChild, actionsChild, otherChildren } = useMemo(() => {
    const slots: {
      modesChild: React.ReactElement | null;
      tabsChild: React.ReactElement | null;
      actionsChild: React.ReactElement | null;
      otherChildren: React.ReactNode[];
    } = {
      modesChild: null,
      tabsChild: null,
      actionsChild: null,
      otherChildren: [],
    };

    childArray.forEach((child) => {
      if (child.type === Modes && !slots.modesChild) {
        slots.modesChild = child;
      } else if (child.type === Tabs && !slots.tabsChild) {
        slots.tabsChild = child;
      } else if (child.type === 操作 && !slots.actionsChild) {
        slots.actionsChild = child;
      } else {
        slots.otherChildren.push(child);
      }
    });

    return slots;
  }, [childArray]);

  const recomputeLayout = useCallback(() => {
    if (!containerRef.current || !tabsRef.current) {
      setStackTabs(false);
      return;
    }

    const containerWidth = containerRef.current.clientWidth;
    const modesWidth = modesRef.current?.offsetWidth ?? 0;
    const actionsWidth = actionsRef.current?.offsetWidth ?? 0;
    const tabsWidth = tabsRef.current.scrollWidth || tabsRef.current.offsetWidth;

    const computedStyle = window.getComputedStyle(containerRef.current);
    const gapValue = computedStyle.columnGap || computedStyle.gap || "0";
    const gap = Number.parseFloat(gapValue) || 0;

    const requiredWidth = modesWidth + tabsWidth + actionsWidth + gap * 2;
    setStackTabs(requiredWidth > containerWidth);
  }, []);

  useEffect(() => {
    recomputeLayout();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      recomputeLayout();
    });

    if (containerRef.current) observer.observe(containerRef.current);
    if (modesRef.current) observer.observe(modesRef.current);
    if (tabsRef.current) observer.observe(tabsRef.current);
    if (actionsRef.current) observer.observe(actionsRef.current);

    return () => observer.disconnect();
  }, [recomputeLayout, modesChild, tabsChild, actionsChild, children]);

  if (stackTabs) {
    return (
      <div ref={containerRef} class名称="space-y-3">
        <div class名称="flex items-center gap-4 min-w-0">
          {modesChild && (
            <div ref={modesRef} class名称="shrink-0">
              {modesChild}
            </div>
          )}

          {actionsChild && (
            <div ref={actionsRef} class名称="ml-auto shrink-0">
              {actionsChild}
            </div>
          )}
        </div>

        {tabsChild && (
          <div ref={tabsRef} class名称="min-w-0 w-full">
            {tabsChild}
          </div>
        )}

        {otherChildren.length > 0 && <>{otherChildren}</>}
      </div>
    );
  }

  return (
    <div ref={containerRef} class名称="flex items-center gap-4 min-w-0">
      {modesChild && (
        <div ref={modesRef} class名称="shrink-0">
          {modesChild}
        </div>
      )}

      {tabsChild && (
        <div ref={tabsRef} class名称="flex-1 min-w-0">
          {tabsChild}
        </div>
      )}

      {actionsChild && (
        <div ref={actionsRef} class名称="ml-auto shrink-0">
          {actionsChild}
        </div>
      )}

      {otherChildren.length > 0 && <>{otherChildren}</>}
    </div>
  );
}

/** Mode toggle dropdown (编辑 / Move) */
export function Modes({ editLabel = "编辑", moveLabel = "Move" }: { editLabel?: string; moveLabel?: string }) {
  const { mode, setMode, enableMoveMode } = use编辑ItemsForm();

  if (!enableMoveMode) return null;

  return (
    <Select value={mode} onValueChange={(value) => setMode(value as "edit" | "move")}>
      <SelectTrigger class名称="w-20">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="edit">{editLabel}</SelectItem>
        <SelectItem value="move">{moveLabel}</SelectItem>
      </SelectContent>
    </Select>
  );
}

/** Container for group tabs */
export function Tabs({ children }: { children: React.ReactNode }) {
  return (
    <div class名称="flex gap-2 p-1 overflow-x-auto frosted rounded-full text-white/20 items-center justify-center">
      {children}
    </div>
  );
}

/**
 * Individual group tab
 * Main button changes current group; caret opens dropdown for rename/delete
 */
export function Tab({
  name,
  onRename,
  on删除,
}: {
  name: string;
  onRename?: () => void;
  on删除?: () => void;
}) {
  const { currentGroup, setCurrentGroup } = use编辑ItemsForm();
  const isActive = currentGroup === name;

  return (
    <div class名称="flex items-center">
      {/* Main tab button - clicking changes group */}
      <button
        onClick={() => setCurrentGroup(name)}
        class名称={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition font-medium ${
          isActive
            ? "bg-white/20 text-foreground"
            : "text-white/70 hover:text-white/80"
        }`}
      >
        {name}
      </button>

      {/* Dropdown trigger for actions - only if actions available */}
      {(onRename || on删除) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button class名称="px-1 opacity-70 hover:opacity-100 transition">
              <FontAwesomeIcon icon={faCaretDown} class名称="text-xs" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {onRename && <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>}
            {on删除 && (
              <DropdownMenuItem onClick={on删除} class名称="text-red-400">
                删除
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/** Button to create a new group */
export function 创建GroupAction({ on创建Group }: { on创建Group: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={on创建Group}
      class名称="text-foreground hover:bg-(--surface-2)"
    >
      <FontAwesomeIcon icon={faPlus} class名称="text-sm" />
    </Button>
  );
}

/** Optional container for additional actions */
export function 操作({
  children,
  class名称 = "",
}: {
  children: React.ReactNode;
  class名称?: string;
}) {
  return (
    <div class名称={`flex items-center gap-2 ${class名称}`}>
      {children}
    </div>
  );
}

// ============================================================================
// CONTENT COMPONENTS
// ============================================================================

/** Container for list items */
export function ListContent({ children }: { children: React.ReactNode }) {
  const hasChildren = React.Children.count(children) > 0;

  if (!hasChildren) {
    return (
      <div class名称="h-20 flex items-center justify-center flex-col font-medium">
        <p class名称="text-lg">Nothing here</p>
        <p>添加 an item to get started</p>
      </div>
    );
  }

  return <div class名称="space-y-3">{children}</div>;
}

/**
 * Single item row with built-in mode icon (move/select) and content wrapper
 * 
 * In "edit" mode: Shows checkbox on left for selection
 * In "move" mode: Shows drag-and-drop icon on left, makes row draggable
 * 
 * Children are rendered in the center with flex-1 space
 * Individual操作 should be passed as last child
 */
export function ListItemPrototype({
  item,
  children,
  onDragStart,
  onDragEnd,
}: {
  item: any;
  children: React.ReactNode;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  const { mode, selected, toggleSelect, handleDragStart: contextDragStart, handleDragOver, handleDragLeave, handleDrop, draggedItemKey, draggedOverItemKey, insertPosition } = use编辑ItemsForm();
  const itemKey = item.id || JSON.stringify(item);
  const isSelected = selected[itemKey];
  const isDragged = draggedItemKey === itemKey;
  const isDraggedOver = draggedOverItemKey === itemKey;

  const handleLocalDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    contextDragStart(itemKey, e);
    onDragStart?.(e);
  };

  const handleLocalDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    onDragEnd?.(e);
  };

  return (
    <>
      {/* Insertion line above */}
      {isDraggedOver && insertPosition === "before" && (
        <div class名称="h-0.5 bg-blue-500 rounded mb-2" />
      )}
      <div
        draggable={mode === "move"}
        onDragStart={handleLocalDragStart}
        onDragEnd={handleLocalDragEnd}
        onDragOver={(e) => handleDragOver(itemKey, e)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(itemKey, e)}
        class名称={`flex items-center gap-3 p-3 rounded-md border border-transparent hover:bg-(--surface-2) transition group cursor-default relative ${
          isDragged ? "opacity-50" : ""
        } ${isDraggedOver ? "bg-(--surface-1)" : ""}`}
      >
        {/* Move or Select Icon - Left side */}
        {mode === "move" && (
          <div class名称="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition">
            <FontAwesomeIcon icon={faArrowsUpDown} class名称="text-white/40" />
          </div>
        )}

        {mode === "edit" && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelect(itemKey)}
            class名称="flex-shrink-0"
          />
        )}

        {/* Content wrapper */}
        <div class名称="flex-1 min-w-0 flex items-center gap-3">
          {children}
        </div>
      </div>
      {/* Insertion line below */}
      {isDraggedOver && insertPosition === "after" && (
        <div class名称="h-0.5 bg-blue-500 rounded mt-2" />
      )}
    </>
  );
}

/** Container for action buttons on the right of list items (only shown in edit mode) */
export function Individual操作({ children }: { children: React.ReactNode }) {
  const { mode } = use编辑ItemsForm();

  if (mode !== "edit") return null;

  return <div class名称="flex-shrink-0 flex gap-1 ml-auto">{children}</div>;
}

/**
 * Single action button for use inside Individual操作
 * 
 * @param type - "edit", "delete", "move", etc. - determines icon
 * @param label - Tooltip text
 * @param onClick - Handler when button clicked
 * @param icon - Optional custom icon (overrides default for type)
 */
export function Action({
  type,
  label,
  onClick,
  icon
}: {
  type: "edit" | "move" | "delete" | "create" | "clean" | "add" | "create-folder";
  label?: string;
  onClick: () => void;
  icon?: IconDefinition;
}) {
  const iconMap: Record<string, IconDefinition> = {
    edit: fa编辑,
    move: faArrowRight,
    delete: faTrash,
    create: faPlus,
    'create-folder': faFolderPlus
  };

  const selectedIcon = icon || iconMap[type];

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      class名称="text-foreground hover:bg-(--surface-2) px-2 h-8 transition-colors"
      title={label}
    >
      {selectedIcon && <FontAwesomeIcon icon={selectedIcon} class名称="text-sm" />}
    </Button>
  );
}

// ============================================================================
// BULK ACTIONS COMPONENTS
// ============================================================================

/** Sticky footer bar that appears when items are selected */
export function Bulk操作Footer({ children }: { children: React.ReactNode }) {
  const { selected } = use编辑ItemsForm();
  const selectedCount = Object.values(selected).filter(Boolean).length;

  if (selectedCount === 0) return null;

  return (
    <div class名称="sticky bottom-0 left-0 right-0 frosted backdrop-blur-lg bg-(--surface-1) border-t border-(--border-color) p-2 flex items-center justify-between gap-4 rounded-full mx-25">
      <div class名称="text-sm">
        <span class名称="font-semibold">{selectedCount}</span>
        <span class名称="text-white/70 ml-2">items selected</span>
      </div>

      <div class名称="flex gap-2">{children}</div>
    </div>
  );
}

/**
 * Preset bulk action buttons (delete, move, create subgroup)
 * Place inside Bulk操作Footer
 */
export function BulkItemsSelected操作({
  on删除,
  onMove,
  on创建Subgroup,
}: {
  on删除?: () => void;
  onMove?: () => void;
  on创建Subgroup?: () => void;
}) {
  const { enableSubgroup } = use编辑ItemsForm();

  return (
    <>
      {on删除 && <Action type="delete" label="删除" onClick={on删除} />}
      {onMove && <Action type="move" label="Move" onClick={onMove} />}
      {on创建Subgroup && enableSubgroup && (
        <Action type="create-folder" label="创建 Folder" onClick={on创建Subgroup} />
      )}
    </>
  );
}

/** Dropdown for tab actions (rarely used directly - Tab component handles this) */
export function TabDropdown({
  group名称,
  onRename,
  on删除,
}: {
  group名称: string;
  onRename?: () => void;
  on删除?: () => void;
}) {
  return (
    <div class名称="group relative">
      <button class名称="text-sm opacity-0 group-hover:opacity-100">⋮</button>
      <div class名称="absolute right-0 top-full bg-white dark:bg-(--surface-2) rounded shadow-lg hidden group-hover:block z-50">
        {onRename && (
          <button onClick={onRename} class名称="block w-full text-left px-4 py-2 text-sm hover:bg-(--surface-3)">
            Rename
          </button>
        )}
        {on删除 && (
          <button
            onClick={on删除}
            class名称="block w-full text-left px-4 py-2 text-sm hover:bg-(--surface-3) text-red-500"
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
}
