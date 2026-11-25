/** Focus ownership for application dialogs only; no invitation document listeners. */
type Entry = { element: HTMLElement; focusFirst: () => void };
const stacks = new WeakMap<Document, Entry[]>();
const selector = 'a[href],button,input,select,textarea,[tabindex]';

export function manageDialogFocus(element: HTMLElement, options: {
  onEscape: () => void;
  initialFocus?: () => HTMLElement | null;
}) {
  const doc = element.ownerDocument;
  const stack = stacks.get(doc) || [];
  stacks.set(doc, stack);
  const entry: Entry = { element, focusFirst: () => focus(first()) };
  const trigger = doc.activeElement as HTMLElement | null;
  stack.push(entry);
  const top = () => stack[stack.length - 1] === entry;
  const controls = () => Array.from(element.querySelectorAll<HTMLElement>(selector)).filter(node =>
    node.tabIndex >= 0 && !node.matches(':disabled') &&
    !node.closest('[hidden],[inert],[aria-hidden="true"]') && node.getClientRects().length > 0,
  );
  const focus = (node: HTMLElement, preventScroll = true) => node.focus({ preventScroll });
  const first = () => controls()[0] || element;
  const keydown = (event: KeyboardEvent) => {
    if (!top() || event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopImmediatePropagation(); options.onEscape();
    } else if (event.key === 'Tab') {
      const nodes = controls(), active = doc.activeElement;
      if (!nodes.length || !nodes.includes(active as HTMLElement) ||
          (event.shiftKey ? active === nodes[0] : active === nodes[nodes.length - 1])) {
        event.preventDefault();
        // Keyboard navigation must reveal the destination in tall mobile dialogs.
        focus(event.shiftKey ? nodes[nodes.length - 1] || element : nodes[0] || element, false);
      }
    }
  };
  const focusin = (event: FocusEvent) => {
    if (top() && !element.contains(event.target as Node)) focus(first());
  };
  doc.addEventListener('keydown', keydown, true);
  doc.addEventListener('focusin', focusin, true);
  const initial = options.initialFocus?.();
  focus(initial && element.contains(initial) ? initial : first());
  return () => {
    const wasTop = top();
    doc.removeEventListener('keydown', keydown, true);
    doc.removeEventListener('focusin', focusin, true);
    const index = stack.indexOf(entry);
    if (index >= 0) stack.splice(index, 1);
    if (!wasTop) return; // Never steal focus from an alert that is still open.
    const remaining = stack[stack.length - 1];
    if (trigger?.isConnected && !trigger.matches(':disabled') &&
        !trigger.closest('[hidden],[inert],[aria-hidden="true"]') && trigger.getClientRects().length > 0 &&
        (!remaining || remaining.element.contains(trigger))) focus(trigger);
    else if (remaining) remaining.focusFirst();
  };
}
