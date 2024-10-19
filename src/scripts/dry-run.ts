import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const cronSecret = process.env.CRON_SECRET;

if (!cronSecret) {
  console.error("Error: CRON_SECRET environment variable is not set.");
  process.exit(1); // Exit with an error code
}

const command = `curl -H "Authorization: Bearer ${cronSecret}" "http://localhost:3000/api/cron?dryRun=true"`;

// Execute the curl command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing curl: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
