import "./global.css";
import "./Routes";

import App from "./App.svelte";
import { click } from "./Utils/Click";

/*
 |--------------------------------------------------------------------------------
 | Global Listeners
 |--------------------------------------------------------------------------------
 */

addEventListener("click", click.handle);

/*
 |--------------------------------------------------------------------------------
 | Route
 |--------------------------------------------------------------------------------
 */

new App({ target: document.getElementById("app") });
