import { For } from "solid-js";

const classes = [
  "bg-base-50",
  "bg-base-100",
  "bg-base-200",
  "bg-base-300",
  "bg-base-400",
  "bg-base-500",
  "bg-base-600",
  "bg-base-700",
  "bg-base-800",
  "bg-base-900",
  "bg-base-950",
  "bg-primary-50",
  "bg-primary-100",
  "bg-primary-200",
  "bg-primary-300",
  "bg-primary-400",
  "bg-primary-500",
  "bg-primary-600",
  "bg-primary-700",
  "bg-primary-800",
  "bg-primary-900",
  "bg-primary-950",
];

export function Palettes() {
  return (
    <div class={"flex"}>
      <For each={classes}>{(v, i) => <div class={`w-12 h-12 ${v}`} />}</For>
    </div>
  );
}
