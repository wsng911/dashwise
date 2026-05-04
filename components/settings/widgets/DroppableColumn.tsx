import { useDroppable } from "@dnd-kit/core";


/* Drop zone for widgets */
export function DroppableColumn({
  id,
  children,
  class名称,
}: {
  id: string;
  children: React.ReactNode;
  class名称?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} class名称={`${class名称 ?? ""} ${isOver ? "outline outline-2 outline-blue-400/40" : ""}`}>
      {children}
    </div>
  );
}
