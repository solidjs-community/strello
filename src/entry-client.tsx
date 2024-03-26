import "@unocss/reset/tailwind.css";
import "uno.css";

// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

mount(() => <StartClient />, document.getElementById("app")!);
