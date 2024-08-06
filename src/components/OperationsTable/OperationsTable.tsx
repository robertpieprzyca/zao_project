import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Popconfirm, Table, message } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { InputRef } from "antd/es/input";

interface Item {
  key: string;
  operation_number: string;
  operation_time?: number;
  next_operation_number: string;
  number_of_resources?: number;
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  placeholder: string;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  placeholder,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (editable) {
      inputRef.current?.focus();
    }
  }, [editable]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSave({ ...record, [dataIndex]: e.target.value });
  };

  let childNode = children;

  if (editable) {
    childNode = (
      <Input
        ref={inputRef}
        defaultValue={record[dataIndex] as string | number}
        placeholder={`e.g. ${placeholder}`}
        onChange={handleChange}
      />
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableColumnType<T> = ColumnType<T> & {
  editable?: boolean;
  placeholder?: string;
};

const OperationsTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<Item[]>([
    {
      key: "0",
      operation_number: "",
      operation_time: undefined,
      next_operation_number: "",
      number_of_resources: undefined,
    },
  ]);

  const [count, setCount] = useState(1);

  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const defaultColumns: EditableColumnType<Item>[] = [
    {
      title: "Operation Number",
      dataIndex: "operation_number",
      width: "30%",
      editable: true,
      placeholder: "A",
    },
    {
      title: "Operation Time",
      dataIndex: "operation_time",
      editable: true,
      placeholder: "10",
    },
    {
      title: "Next Operation Number",
      dataIndex: "next_operation_number",
      editable: true,
      placeholder: "A,B",
    },
    {
      title: "Number of Resources",
      dataIndex: "number_of_resources",
      editable: true,
      placeholder: "3",
    },
    {
      title: "Delete",
      dataIndex: "delete",
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key)}
          >
            <a>x</a>
          </Popconfirm>
        ) : null,
    },
  ];

  const handleAdd = () => {
    const newData: Item = {
      key: (count + 1).toString(),
      operation_number: "",
      operation_time: undefined,
      next_operation_number: "",
      number_of_resources: undefined,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleSave = (row: Item) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    newData.splice(index, 1, { ...newData[index], ...row });
    setDataSource(newData);
  };

  const validateRow = (item: Item) => {
    const errors: string[] = [];
    if (!item.operation_number) errors.push("Operation Number is required.");
    if (!item.next_operation_number)
      errors.push("Next Operation Number is required.");
    if (item.operation_time === undefined || isNaN(item.operation_time))
      errors.push("Operation Time must be a valid number.");
    if (
      item.number_of_resources === undefined ||
      isNaN(item.number_of_resources)
    )
      errors.push("Number of Resources must be a valid number.");
    return errors;
  };

  const handleSaveAll = () => {
    const errors: string[] = [];

    const validatedData = dataSource.map((item) => {
      const rowErrors = validateRow(item);
      if (rowErrors.length) {
        errors.push(`Row with key ${item.key}: ${rowErrors.join(", ")}`);
      }
      return item;
    });

    if (errors.length) {
      message.error(`Validation failed: ${errors.join(" | ")}`);
    } else {
      console.log("Saved data:", JSON.stringify(validatedData, null, 2));
      localStorage.setItem("operationsData", JSON.stringify(validatedData));
      message.success("All data saved successfully!");
    }
  };

  const components = {
    body: {
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        placeholder: col.placeholder,
        handleSave,
      }),
    };
  });

  return (
    <div>
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnsType<Item>}
        pagination={false}
      />
      <div className="action-buttons">
        <Button onClick={handleAdd} type="primary">
          Add a row
        </Button>
        <Button type="primary" onClick={handleSaveAll}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default OperationsTable;
