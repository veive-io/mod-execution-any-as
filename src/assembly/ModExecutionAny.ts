import { System, Storage } from "@koinos/sdk-as";
import { modexecutionany } from "./proto/modexecutionany";
import { ModExecution, modexecution } from "@veive/mod-execution-as";
import { MODULE_EXECUTION_SPACE_ID } from "@veive/account-as";

const CONFIG_SPACE_ID = 1;

export class ModExecutionAny extends ModExecution {

  callArgs: System.getArgumentsReturn | null;

  contractId: Uint8Array = System.getContractId();

  config_storage: Storage.Obj<modexecutionany.config_storage> =
    new Storage.Obj(
      this.contractId,
      CONFIG_SPACE_ID,
      modexecutionany.config_storage.decode,
      modexecutionany.config_storage.encode,
      () => new modexecutionany.config_storage()
    );

  /**
   * @external
   * @readonly
   */
  manifest(): modexecution.manifest {
    const result = new modexecution.manifest();
    result.name = "Module execution any";
    result.description = "Execute any operation with this module";
    result.type_id = MODULE_EXECUTION_SPACE_ID;
    return result;
  }

  /**
   * Executes the specified operation.
   * 
   * This method is called to perform a specific operation, which may include 
   * smart contract calls or other actions defined in the execution module.
   * @external
   */
  execute(args: modexecution.execute_args): void {
    System.log("[mod-execution-any] execute called");

    // check if operation entry_point is in skip list
    if (
      this.config_storage.get()!.skip_entry_points.includes(args.operation!.entry_point)
    ) {
      System.log(`[mod-execution-any] skip ${args.operation!.entry_point.toString()}`);

    } else {

      System.log(`[mod-execution-any] calling ${args.operation!.entry_point.toString()}`);

      let call_args = new Uint8Array(0);
      if (args.operation!.args && args.operation!.args!.length > 0) {
        call_args = args.operation!.args!;
      }
  
      System.call(
        args.operation!.contract_id!,
        args.operation!.entry_point,
        call_args
      );
    }
  }

  /**
   * Adds an antry point to skip list
   * @external
   */
  add_skip_entry_point(args: modexecutionany.add_skip_entry_point_args): void {
    const config = this.config_storage.get() || new modexecutionany.config_storage();

    // Check for duplicates
    for (let i = 0; i < config.skip_entry_points.length; i++) {
      if (config.skip_entry_points[i] == args.entry_point) {
        System.log("Entry point already exists");
        return;
      }
    }

    // Add new entry
    config.skip_entry_points.push(args.entry_point);
    this.config_storage.put(config);
  }

  /**
   * Removes an antry point from skips
   * @external
   */
  remove_skip_entry_point(args: modexecutionany.remove_skip_entry_point_args): void {
    const config = this.config_storage.get();
    System.require(config != null, "Configuration not found");

    const new_skip_entry_points: u32[] = [];

    for (let i = 0; i < config!.skip_entry_points.length; i++) {
      if (config!.skip_entry_points[i] != args.entry_point) {
        new_skip_entry_points.push(config!.skip_entry_points[i]);
      }
    }

    config!.skip_entry_points = new_skip_entry_points;
    this.config_storage.put(config!);
  }

  /**
   * Reads the skip_entry_points
   * @external
   * @readonly
   */
  get_skip_entry_points(): modexecutionany.get_skip_entry_points_result {
    const config = this.config_storage.get();
    System.require(config != null, "Configuration not found");
    return new modexecutionany.get_skip_entry_points_result(config!.skip_entry_points);
  }
}