import { spawn } from "child_process";

export async function setup(target: string) {
  console.log("Running setup for", target);

  const cursor = spawn(`npm`, ["i"], { stdio: "inherit", cwd: `./${target}` });

  return new Promise(async (resolve, reject) => {
    cursor.on("close", resolve);
    cursor.on("error", reject);
  });
}
