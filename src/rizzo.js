import Logger from "./core/logger";
import ComponentRegistry from "./core/component_registry";
import PerfMonitor from "./core/perf_monitor";
import Rizzo from "./core/rizzo";

let logger = new Logger();

let rizzo = window.rizzo = new Rizzo({
  registry: new ComponentRegistry({ logger }),
  perf: new PerfMonitor(),
  logger
});

export default rizzo;
