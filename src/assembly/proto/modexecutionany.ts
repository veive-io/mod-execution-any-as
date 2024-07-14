import { Writer, Reader } from "as-proto";

export namespace modexecutionany {
  export class config_storage {
    static encode(message: config_storage, writer: Writer): void {
      const unique_name_skip_entry_points = message.skip_entry_points;
      if (unique_name_skip_entry_points.length !== 0) {
        for (let i = 0; i < unique_name_skip_entry_points.length; ++i) {
          writer.uint32(8);
          writer.uint32(unique_name_skip_entry_points[i]);
        }
      }
    }

    static decode(reader: Reader, length: i32): config_storage {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new config_storage();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.skip_entry_points.push(reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    skip_entry_points: Array<u32>;

    constructor(skip_entry_points: Array<u32> = []) {
      this.skip_entry_points = skip_entry_points;
    }
  }

  @unmanaged
  export class add_skip_entry_point_args {
    static encode(message: add_skip_entry_point_args, writer: Writer): void {
      if (message.entry_point != 0) {
        writer.uint32(8);
        writer.uint32(message.entry_point);
      }
    }

    static decode(reader: Reader, length: i32): add_skip_entry_point_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new add_skip_entry_point_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.entry_point = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    entry_point: u32;

    constructor(entry_point: u32 = 0) {
      this.entry_point = entry_point;
    }
  }

  @unmanaged
  export class remove_skip_entry_point_args {
    static encode(message: remove_skip_entry_point_args, writer: Writer): void {
      if (message.entry_point != 0) {
        writer.uint32(8);
        writer.uint32(message.entry_point);
      }
    }

    static decode(reader: Reader, length: i32): remove_skip_entry_point_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new remove_skip_entry_point_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.entry_point = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    entry_point: u32;

    constructor(entry_point: u32 = 0) {
      this.entry_point = entry_point;
    }
  }

  export class get_skip_entry_points_result {
    static encode(message: get_skip_entry_points_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value.length !== 0) {
        for (let i = 0; i < unique_name_value.length; ++i) {
          writer.uint32(8);
          writer.uint32(unique_name_value[i]);
        }
      }
    }

    static decode(reader: Reader, length: i32): get_skip_entry_points_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_skip_entry_points_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value.push(reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Array<u32>;

    constructor(value: Array<u32> = []) {
      this.value = value;
    }
  }
}
