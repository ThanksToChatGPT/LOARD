/** Une clases CSS, descartando las que no aplican. */
export function cn(...partes: Array<string | false | null | undefined>): string {
  return partes.filter(Boolean).join(' ');
}
