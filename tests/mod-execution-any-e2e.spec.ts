import { LocalKoinos } from "@roamin/local-koinos";
import { Contract, Signer, Transaction, Provider, utils } from "koilib";
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

const mod = new Contract({
    id: modSign.getAddress(),
    abi: modAbi,
    provider
});

const modContract = mod.functions;
const modSerializer = mod.serializer;

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

it("install module in scope default", async () => {
    const scope = await modSerializer.serialize({
        entry_point: 1
    }, "scope");

    const { operation: install_module } = await accountContract["install_module"]({
        module_type_id: 2,
        contract_id: modSign.address,
        scopes: [
            utils.encodeBase64url(scope)
        ]
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
    expect(receipt.logs).toContain("[mod-execution-any] called on_install");

    const { result } = await accountContract["get_modules"]();
    expect(result.value).toStrictEqual([modSign.address]);
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

it("reinstall module in scope (entry_point=transfer)", async () => {
    // uninstall module
    const { operation: uninstall_module } = await accountContract["uninstall_module"]({
        module_type_id: 2,
        contract_id: modSign.address
    }, { onlyOperation: true });

    const { operation: exec_uninstall_module } = await accountContract["execute_user"]({
        operation: {
            contract_id: uninstall_module.call_contract.contract_id,
            entry_point: uninstall_module.call_contract.entry_point,
            args: uninstall_module.call_contract.args
        }
    }, { onlyOperation: true });

    // install module in a new scope
    const scope = await modSerializer.serialize({
        entry_point: 1234
    }, "scope");

    const { operation: install_module } = await accountContract["install_module"]({
        module_type_id: 2,
        contract_id: modSign.address,
        scopes: [
            utils.encodeBase64url(scope)
        ]
    }, { onlyOperation: true });

    const { operation: exec_install_module } = await accountContract["execute_user"]({
        operation: {
            contract_id: install_module.call_contract.contract_id,
            entry_point: install_module.call_contract.entry_point,
            args: install_module.call_contract.args
        }
    }, { onlyOperation: true });

    const tx = new Transaction({
        signer: accountSign,
        provider,
    });

    await tx.pushOperation(exec_uninstall_module);
    await tx.pushOperation(exec_install_module);
    const receipt = await tx.send();
    await tx.wait();

    expect(receipt).toBeDefined();
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

    let error = undefined;

    try {
        await tx.send();
        await tx.wait();
    } catch (e) {
        error = e.message;
    }

    expect(error).toBeDefined();
    expect(error).toContain('[account] no execution found');
});

it("uninstall module", async () => {
    const { operation: uninstall_module } = await accountContract["uninstall_module"]({
        module_type_id: 2,
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