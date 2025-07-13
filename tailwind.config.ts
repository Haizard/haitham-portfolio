
// This file is the project's root Tailwind config. 
// It is intentionally kept simple and imports the main configuration from the /src directory.
// Please make all Tailwind customizations in `src/tailwind.config.ts`.

import type { Config } from "tailwindcss"
import sharedConfig from "./src/tailwind.config"

const config: Pick<Config, "presets"> = {
  presets: [sharedConfig],
}

export default config
