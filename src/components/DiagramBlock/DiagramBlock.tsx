import React from "react";
import { Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import "./DiagramBlock.css";

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const columns: TableColumnsType<DataType> = [
  {
    title: "",
    dataIndex: "name",
    key: "name",
    render: (text, record, index) => {
      // Merge the middle row
      if (index === 1) {
        return {
          children: "Merged Row",
          props: {
            colSpan: 3,
          },
        };
      }
      return text;
    },
    width: "33%",
  },
  {
    title: "",
    dataIndex: "age",
    key: "age",
    render: (text, record, index) => {
      if (index === 1) {
        return {
          props: {
            colSpan: 0,
          },
        };
      }
      return text;
    },
    width: "33%",
  },
  {
    title: "",
    dataIndex: "address",
    key: "address",
    render: (text, record, index) => {
      if (index === 1) {
        return {
          props: {
            colSpan: 0,
          },
        };
      }
      return text;
    },
    width: "34%",
  },
];

const data: DataType[] = [
  {
    key: "1",
    name: "10",
    age: 10,
    address: "10",
  },
  {
    key: "2",
    name: "10", // This row will be merged
    age: 42,
    address: "10",
  },
  {
    key: "3",
    name: "10",
    age: 32,
    address: "10",
  },
];

const onChange: TableProps<DataType>["onChange"] = (
  pagination,
  filters,
  sorter,
  extra
) => {
  console.log("params", pagination, filters, sorter, extra);
};

const DiagramBlock: React.FC = () => (
  <div className="diagram-block">
    <Table
      columns={columns}
      dataSource={data}
      onChange={onChange}
      bordered
      pagination={false}
      showHeader={false}
      className="diagram-block-table"
    />
  </div>
);

export default DiagramBlock;
