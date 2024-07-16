import { System, Storage, authority } from "@koinos/sdk-as";
import { modexecutionany } from "./proto/modexecutionany";
import { ModExecution, modexecution } from "@veive/mod-execution-as";
import { MODULE_EXECUTION_SPACE_ID } from "@veive/account-as";

const CONFIG_SPACE_ID = 1;
const ACCOUNT_SPACE_ID = 2;

/**
 * The `ModExecutionAny` class is a versatile execution module designed for the Koinos blockchain. 
 * It extends the `ModExecution` module from the Veive protocol, providing the functionality to execute 
 * any operation while allowing configuration of specific entry points to be skipped.
 * 
 * This class supports the following key features:
 * 
 * - **Execution of Any Operation**: Allows the execution of any specified operation, which may include smart contract calls or other actions.
 * - **Configurable Skip Entry Points**: Enables the configuration of entry points to be skipped during execution. This is useful for excluding certain operations from being executed by this module.
 * - **Permission Checks**: Uses the `account_id` of the account on which the module is installed to ensure that only authorized accounts can modify the skip list.
 * - **Storage Management**: Utilizes storage objects to maintain configuration and account information, ensuring data persistence and retrieval.
 * 
 * The `ModExecutionAny` class overrides the `on_install` method to save the `account_id` of the account it is installed on. This allows for proper permission checks when configuring the skip list, ensuring that only authorized accounts can make modifications.
 */
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

  account_id: Storage.Obj<modexecutionany.account_id> =
    new Storage.Obj(
      this.contractId,
      ACCOUNT_SPACE_ID,
      modexecutionany.account_id.decode,
      modexecutionany.account_id.encode,
      () => new modexecutionany.account_id()
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
    if (this.config_storage.get()!.skip_entry_points.includes(args.operation!.entry_point)) {
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
    const is_authorized = System.checkAuthority(authority.authorization_type.contract_call, this._get_account_id());
    System.require(is_authorized, "not authorized by the account");

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
    const is_authorized = System.checkAuthority(authority.authorization_type.contract_call, this._get_account_id());
    System.require(is_authorized, "not authorized by the account");

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

  /**
  * @external
  */
  on_install(args: modexecution.on_install_args): void {
    const account = new modexecutionany.account_id();
    account.value = System.getCaller().caller;
    this.account_id.put(account);
    System.log('[mod-execution-any] called on_install');
  }

  /**
   * Get associated account_id
   * 
   * @external
   * @readonly
   */
  get_account_id(): modexecutionany.account_id {
    return this.account_id.get()!;
  }

  /**
   * return account id
   */
  _get_account_id(): Uint8Array {
    return this.account_id.get()!.value!;
  }

}