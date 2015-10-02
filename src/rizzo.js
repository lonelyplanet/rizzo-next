import Logger from "./core/logger";
import ComponentRegistry from "./core/component_registry";
import Rizzo from "./core/rizzo";

let logger = new Logger();

let rizzo = window.rizzo = new Rizzo({
  registry: new ComponentRegistry({ logger }),
  logger
});

export default rizzo;
