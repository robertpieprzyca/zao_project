import OperationsTable from "./components/OperationsTable/OperationsTable.tsx";
import DiagramBlock from "./components/DiagramBlock/DiagramBlock.tsx";
import DiagramField from "./components/DiagramField/DiagramField.tsx";

function App() {
  return (
    <div>
      <div>
        <OperationsTable></OperationsTable>
      </div>
      <div>
        <DiagramBlock></DiagramBlock>
      </div>
      <div>
        <DiagramField></DiagramField>
      </div>
    </div>
  );
}

export default App;
