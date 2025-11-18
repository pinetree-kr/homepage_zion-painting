export function getScrollbarWidth(): number {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    const scrollbarWidth = (outer.offsetWidth - outer.clientWidth);

    outer.parentNode?.removeChild?.(outer);
    return scrollbarWidth;
}   