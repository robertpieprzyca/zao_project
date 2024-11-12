import OperationsTable from "./components/OperationsTable/OperationsTable.tsx";
import DiagramField from "./components/DiagramField/DiagramField.tsx";
import ScheduleField from "./components/ScheduleField/ScheduleField.tsx";
import "./App.css";

function App() {
  return (
    <div className="page_wrapper">
      <OperationsTable></OperationsTable>
      <DiagramField></DiagramField>
      <ScheduleField></ScheduleField>
    </div>
  );
}

export default App;
