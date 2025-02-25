import { Base58, StringBytes, System } from "@koinos/sdk-as";
import { ModExecution, modexecution, MODULE_EXECUTION_TYPE_ID } from "@veive-io/mod-execution-as";

export class ModExecutionAny extends ModExecution {

  callArgs: System.getArgumentsReturn | null;

  contractId: Uint8Array = System.getContractId();

  /**
   * @external
   * @readonly
   */
  manifest(): modexecution.manifest {
    const result = new modexecution.manifest();
    result.name = "Execution any";
    result.description = "Execute any operation";
    result.type_id = MODULE_EXECUTION_TYPE_ID;
    result.version = "2.0.0";
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

    const call_res = System.call(
      args.operation!.contract_id!,
      args.operation!.entry_point,
      call_args
    );

    if (call_res.code != 0) {
      const errorMessage = `failed to call ${Base58.encode(args.operation!.contract_id!)}: ${call_res.res.error && call_res.res.error!.message ? call_res.res.error!.message : "unknown error"}`;
      System.exit(call_res.code, StringBytes.stringToBytes(errorMessage));
    }
  }

  /**
  * @external
  */
  on_install(args: modexecution.on_install_args): void {
    System.log('[mod-execution-any] called on_install');
  }

}