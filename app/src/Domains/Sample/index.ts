import { handle } from "./CommandHandlers";
import { CreateSample } from "./Commands/CreateSample";
import { SetSampleText } from "./Commands/SetSampleText";

declare global {
  interface Window {
    CreateSample: typeof CreateSample;
    SetSampleText: typeof SetSampleText;
    handle: typeof handle;
  }
}

window.CreateSample = CreateSample;
window.SetSampleText = SetSampleText;
window.handle = handle;
