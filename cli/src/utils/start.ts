import { spawn } from "child_process";

export async function start(target: string) {
  console.log("Starting", target);

  const cursor = spawn(`npm`, ["run", "dev"], { stdio: "inherit", cwd: `./${target}` });

  //   if (cursor.stdout) {
  //     for await (const data of cursor.stdout) {
  //       console.log(`${target}: ${data}`);
  //     }
  //   }
}
