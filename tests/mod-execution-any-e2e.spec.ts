import { LocalKoinos } from "@roamin/local-koinos";
import { Contract, Signer, Transaction, Provider } from "koilib";
import path from "path";
import { randomBytes } from "crypto";
import { beforeAll, afterAll, it, expect } from "@jest/globals";
import * as dotenv from "dotenv";
import * as modAbi from "../build/modexecutionany-abi.json";
import * as accountAbi from "@veive/account-as/dist/account-abi.json";

dotenv.config();

jest.setTimeout(600000);

const localKoinos = new LocalKoinos();
const provider = localKoinos.getProvider() as unknown as Provider;

const modSign = new Signer({
    privateKey: randomBytes(32).toString("hex"),
    provider
});

const modContract = new Contract({
    id: modSign.getAddress(),
    abi: modAbi,
    provider
}).functions;

const accountSign = new Signer({
    privateKey: randomBytes(32).toString("hex"),
    provider
});

const accountContract = new Contract({
    id: accountSign.getAddress(),
    abi: accountAbi,
    provider
}).functions;

beforeAll(async () => {
    // start local-koinos node
    await localKoinos.startNode();
    await localKoinos.startBlockProduction();

    // deploy mod contract
    await localKoinos.deployContract(
        modSign.getPrivateKey("wif"),
        path.join(__dirname, "../build/release/ModExecutionAny.wasm"),
        modAbi
    );

    // deploy account contract
    await localKoinos.deployContract(
        accountSign.getPrivateKey("wif"),
        path.join(__dirname, "../node_modules/@veive/account-as/dist/release/Account.wasm"),
        accountAbi,
        {},
        {
            authorizesCallContract: true,
            authorizesTransactionApplication: false,
            authorizesUploadContract: false,
        }
    );
});

afterAll(() => {
    // stop local-koinos node
    localKoinos.stopNode();
});

it("install module", async () => {
    const { operation: install_module } = await accountContract["install_module"]({
        module_type_id: 1,
        contract_id: modSign.address
    }, { onlyOperation: true });

    const tx = new Transaction({
        signer: accountSign,
        provider
    });

    const { operation: exec } = await accountContract["execute_user"]({
        operation: {
            contract_id: install_module.call_contract.contract_id,
            entry_point: install_module.call_contract.entry_point,
            args: install_module.call_contract.args
        }
    }, { onlyOperation: true });

    await tx.pushOperation(exec);
    const receipt = await tx.send();
    await tx.wait();

    expect(receipt).toBeDefined();
    expect(receipt.logs).toContain("[mod-execution] called module install");

    const { result } = await accountContract["get_modules"]();
    expect(result.value[0]).toStrictEqual(modSign.address);
});

it("trigger module", async () => {
    const { operation: test } = await accountContract["test"]({}, { onlyOperation: true });

    const tx = new Transaction({
        signer: accountSign,
        provider
    });

    const { operation: exec } = await accountContract["execute"]({
        operation: {
            contract_id: test.call_contract.contract_id,
            entry_point: test.call_contract.entry_point
        }
    }, { onlyOperation: true });

    await tx.pushOperation(exec);
    const receipt = await tx.send();
    await tx.wait();
    
    expect(receipt).toBeDefined();
    expect(receipt.logs).toContain("[mod-execution-any] execute called");
    expect(receipt.logs).toContain(`[mod-execution-any] calling ${test.call_contract.entry_point}`);
});

it("add skip entry_point", async () => {
    // prepare operation to obtain entry_point
    const { operation: test } = await accountContract["test"]({}, { onlyOperation: true });

    // set skip entry point
    const { operation: set_config } = await modContract['add_skip_entry_point']({
        entry_point: test.call_contract.entry_point
    }, { onlyOperation: true });

    const tx = new Transaction({
        signer: accountSign,
        provider,
    });

    await tx.pushOperation(set_config);
    const receipt = await tx.send();
    await tx.wait();

    expect(receipt).toBeDefined();

    const { result } = await modContract['get_skip_entry_points']();
    expect(result.value).toStrictEqual([test.call_contract.entry_point]);
});

it("operation skipped", async () => {
    const { operation: test } = await accountContract["test"]({}, { onlyOperation: true });

    const tx = new Transaction({
        signer: accountSign,
        provider
    });

    const { operation: exec } = await accountContract["execute"]({
        operation: {
            contract_id: test.call_contract.contract_id,
            entry_point: test.call_contract.entry_point
        }
    }, { onlyOperation: true });

    await tx.pushOperation(exec);
    const receipt = await tx.send();
    await tx.wait();

    expect(receipt).toBeDefined();
    expect(receipt.logs).toContain(`[mod-execution-any] skip ${test.call_contract.entry_point}`);
});

it("uninstall module", async () => {
    const { operation: uninstall_module } = await accountContract["uninstall_module"]({
        module_type_id: 1,
        contract_id: modSign.address
    }, { onlyOperation: true });

    const tx = new Transaction({
        signer: accountSign,
        provider
    });

    const { operation: exec } = await accountContract["execute_user"]({
        operation: {
            contract_id: uninstall_module.call_contract.contract_id,
            entry_point: uninstall_module.call_contract.entry_point,
            args: uninstall_module.call_contract.args
        }
    }, { onlyOperation: true });

    await tx.pushOperation(exec);
    const receipt = await tx.send();
    await tx.wait();

    expect(receipt).toBeDefined();
    expect(receipt.logs).toContain("[mod-execution] called module uninstall");

    const { result } = await accountContract["get_modules"]();
    expect(result).toBeUndefined();
});