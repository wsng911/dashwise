import { Widget } from "@/app/(config-wrapper)/settings/widgets/page";
import WidgetComponent from "@/components/widgets/Widget";
import { CSS } from "@dnd-kit/utilities";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";

/**
 * Sortable Widget component; meaning a wrapper for the widget to be dagged
 */
export function SortableWidget({
  widget,
  activeId,
  on编辑,
  on移除,
}: {
  widget: Widget;
  activeId?: string | null;
  on编辑?: () => void;
  on移除?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: widget.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: activeId === widget.id ? 0 : 1,
    pointerEvents: activeId === widget.id ? "none" : undefined,
  } as any;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} class名称="relative">
      <WidgetComponent type={widget.type} params={widget.properties || {}} class名称="h-[90px] w-full" />
      {on编辑 && (
        <Button variant="outline" class名称="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10" onClick={on编辑}>
          编辑
        </Button>
      )}
      {on移除 && ( 
        <Button variant="outline" class名称="absolute top-2 right-12 p-1 hover:bg-white/10 rounded-full" onClick={on移除}>
          移除
        </Button>
      )}
    </div>
  );
}