import Task4 from "./tasks/Task4";

import { Auth } from "@course/auth-component";

function App() {
  return (
    <Auth>
      <div className="flex h-screen items-center justify-center">
        <Task4 />
      </div>
    </Auth>
  );
}

export default App;
