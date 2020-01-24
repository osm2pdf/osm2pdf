export default function log(...props: string[]): void {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(props.join(' '));
}
