# **Mod Execution Any**

## **Overview**

`ModExecutionAny` is a versatile execution module within the Veive protocol, tailored for the Koinos blockchain. This module's primary function is to execute any specified operation, providing a generic yet powerful tool for developers and users to perform a wide range of actions within the Veive ecosystem. By leveraging `ModExecutionAny`, users can seamlessly interact with smart contracts and other blockchain components without needing to create custom execution logic for each operation.

Full documentation: https://docs.veive.io/veive-docs/framework/core-modules/mod-execution-any

## **Usage**

### **Installation**

To install the `ModExecutionAny` module, ensure you have the Veive protocol set up on your Koinos blockchain environment. Install the module using yarn:

```bash
yarn add @veive-io/mod-execution-any-as
```

Deploy the module contract on the Koinos blockchain and install it on the desired account using the `install_module` method provided by the Veive account interface. During installation, the `on_install` method is called to set the necessary configurations and link the module to the account.

### **Scripts**

#### Build

To compile the package, run:

```bash
yarn build
```

#### Dist

To create a distribution, run:

```bash
yarn dist
```

#### Test

To test the package, use:

```bash
yarn jest
```

## **Contributing**

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/veiveprotocol/mod-execution-any).

## **License**

This project is licensed under the MIT License. See the LICENSE file for details.
