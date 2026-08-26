import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  build: {
    externalPackages: ["pg", "pg-cloudflare"]
  }
});
