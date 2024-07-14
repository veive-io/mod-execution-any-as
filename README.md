# Veive SCA Module Execution Any

The `ModExecutionAny` class is a versatile execution module designed for the Koinos blockchain. It enables the execution of any operation, with the ability to configure specific entry points to be skipped. This class extends the `ModExecution` module from the Veive protocol, allowing for flexible and controlled execution of various operations.

## Overview

The `ModExecutionAny` module provides the functionality to execute any operation while allowing the configuration of specific entry points to be skipped. This is useful in scenarios where certain operations should not be executed by this module. The module saves the `account_id` of the account it is installed on, enabling permission checks for configuring the skip list.

## Installation

To install the package, use npm or yarn:

```bash
npm install @veive/mod-execution-any
```

## Usage

### Importing the Package

First, import the necessary components from the package:

```typescript
import { ModExecutionAny } from '@veive/mod-execution-any';
```

## Interface and Methods

The `ModExecutionAny` class provides several methods for managing the execution of operations and configuring skip entry points. Below is a brief overview of the key methods:

### `execute`
Executes the specified operation. This method is called to perform a specific operation, which may include smart contract calls or other actions defined in the execution module.

### `add_skip_entry_point`
Adds an entry point to the skip list. This method ensures that the specified entry point is skipped during execution.

### `remove_skip_entry_point`
Removes an entry point from the skip list. This method ensures that the specified entry point is no longer skipped during execution.

### `get_skip_entry_points`
Reads the list of skip entry points. This method returns the list of entry points that are configured to be skipped.

### `on_install`
Overrides the `on_install` method to save the `account_id` of the account on which the module is installed. This allows for permission checks when configuring the skip list.

### `get_account_id`
Retrieves the associated `account_id`. This method returns the `account_id` of the account on which the module is installed.

## Scripts

### Build

To compile the package, run:

```bash
yarn build
```

### Test

To run the tests, run:

```bash
yarn jest
```

### Dist

To create a distribution, run:

```bash
yarn dist
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/veiveprotocol).

## License

This project is licensed under the MIT License. See the LICENSE file for details.