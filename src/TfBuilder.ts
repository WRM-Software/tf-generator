import type { TfObject } from "./values.js";
import { Ref } from "./markers.js";
import { Addressable } from "./Addressable.js";
import type { IR } from "./ir.js";

/**
 * Contract — Builder API (Block B).
 *
 * The single builder end users interact with. `ir` accumulates declarations;
 * emitters (Block C) read it directly. `Addressable` and `IR` stay internal —
 * only `TfBuilder` is exported from `src/index.ts` (task 5).
 */
export class TfBuilder {
  readonly ir: IR = {
    provider: [],
    resource: [],
    data: [],
    variable: [],
    output: [],
    module: [],
  };

  terraform(body: TfObject): this {
    this.ir.terraform = { ...this.ir.terraform, ...body };
    return this;
  }

  provider(name: string, body: TfObject): this {
    this.ir.provider.push({ name, body });
    return this;
  }

  resource(type: string, name: string, body: TfObject): Addressable {
    this.ir.resource.push({ type, name, body });
    return new Addressable(`${type}.${name}`);
  }

  data(type: string, name: string, body: TfObject): Addressable {
    this.ir.data.push({ type, name, body });
    return new Addressable(`data.${type}.${name}`);
  }

  variable(name: string, body?: TfObject): Ref {
    this.ir.variable.push({ name, body: body ?? {} });
    return new Ref(`var.${name}`);
  }

  output(name: string, body: TfObject): this {
    this.ir.output.push({ name, body });
    return this;
  }

  module(name: string, body: TfObject): Addressable {
    this.ir.module.push({ name, body });
    return new Addressable(`module.${name}`);
  }
}
