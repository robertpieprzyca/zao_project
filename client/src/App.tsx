import OperationsTable from "./components/OperationsTable/OperationsTable.tsx";
import DiagramField from "./components/DiagramField/DiagramField.tsx";
import "./App.css";

function App() {
  return (
    <div className="page_wrapper">
      <OperationsTable></OperationsTable>
      <DiagramField></DiagramField>
    </div>
  );
}

export default App;
