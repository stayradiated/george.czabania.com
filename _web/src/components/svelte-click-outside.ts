const isNode = (node: unknown): node is Node => {
  return typeof node === "object" && node !== null && "nodeType" in node;
};

const eventOutside = <EventType extends keyof DocumentEventMap>(
  node: Node,
  eventType: EventType,
  onEventOutside: (event: DocumentEventMap[EventType]) => void,
) => {
  const handleEvent = (event: DocumentEventMap[EventType]) => {
    if (
      node &&
      isNode(event.target) &&
      !node.contains(event.target) &&
      !event.defaultPrevented
    ) {
      onEventOutside(event);
    }
  };
  document.addEventListener(eventType, handleEvent, true);
  return {
    destroy() {
      document.removeEventListener(eventType, handleEvent, true);
    },
  };
};

const clickOutside = (
  node: Node,
  onEventOutside: (event: MouseEvent) => void,
) => {
  return eventOutside(node, "click", onEventOutside);
};

export { clickOutside };
