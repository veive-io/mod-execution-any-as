# Veive SCA Execution Module

This package provides the interface and protobuf definitions to be used for developing execution modules that add functionality to the Veive smart account on the Koinos blockchain. It is inspired by the ERC-7579 standard.

ERC-7579 defines a standard interface for modular smart accounts. In this context, a module represents a pluggable unit that adds specific functionality to a smart account. Execution modules specifically handle tasks such as the execution logic, making smart accounts more flexible and extensible. This allows developers to create custom execution modules that can be easily integrated into the Veive smart account system on the Koinos blockchain.

## Installation

To install the package, use npm or yarn:

```bash
npm install @veive/mod-execution
```

## Usage

### Importing the Package

First, import the necessary components from the package:

```typescript
import { modexecution, Modexecution, IModexecution } from '@veive/mod-execution';
```

### Example Implementation

Create an execution module by extending `Modexecution`:

```typescript
import { Modexecution } from '@veive/mod-execution';

class MyExecutionModule extends Modexecution {
  // Your implementation here
}
```

## Interface

ModExecution class includes methods for executing specific operations, allowing the addition 
of executable functionality to smart accounts in a modular fashion.

The class is designed to be used within a modular smart account system, enabling 
pluggable execution logic that can be easily extended or modified.

Key Methods:
- `execute`: Executes the specified operation, which may include smart contract calls 
             or other actions defined in the execution module.

The `execute` method can be called by authorized modules to perform specific operations 
necessary for the functionality of the smart account system.


## Scripts

### Build

To compile the package, run:

```bash
yarn build
```

### Release

To create a release, run:

```bash
yarn release
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/veiveprotocol).

## License

This project is licensed under the MIT License. See the LICENSE file for details.