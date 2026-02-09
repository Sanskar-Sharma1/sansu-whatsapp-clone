import { useContext } from "react";
import Login from "./components/Login";
import { AuthContext } from "./context/AuthContext";
import ChatsList from "./components/Chats";

function App() {
  const { userId } = useContext(AuthContext);
  return <>
    { userId ? 
    <ChatsList/> :
      <Login /> }
    </>
}

export default App;
