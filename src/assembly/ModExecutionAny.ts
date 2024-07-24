import { System, Storage } from "@koinos/sdk-as";
import { modexecutionany } from "./proto/modexecutionany";
import { ModExecution, modexecution, MODULE_EXECUTION_TYPE_ID } from "@veive/mod-execution-as";

const ACCOUNT_SPACE_ID = 2;

export class ModExecutionAny extends ModExecution {

  callArgs: System.getArgumentsReturn | null;

  contractId: Uint8Array = System.getContractId();

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
    result.type_id = MODULE_EXECUTION_TYPE_ID;
    result.scopes = [
      new modexecution.scope(1)
    ];
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