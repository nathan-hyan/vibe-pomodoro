export function attachGlowEffect(element: HTMLElement) {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // For border glow effect
    element.style.setProperty("--mouse-x", `${x}px`);
    element.style.setProperty("--mouse-y", `${y}px`);

    // For interior cursor glow effect
    element.style.setProperty("--cursor-x", `${x}px`);
    element.style.setProperty("--cursor-y", `${y}px`);
  };

  element.addEventListener("mousemove", handleMouseMove);

  return () => {
    element.removeEventListener("mousemove", handleMouseMove);
  };
}
