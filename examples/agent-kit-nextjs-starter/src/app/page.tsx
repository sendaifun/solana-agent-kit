import Agents from "./components/agents-container";
import Footer from "./components/footer";
import Header from "./components/hero";
import Navbar from "./components/nav-bar";

export default function Home() {
  return (
    <div className="w-full mb-10 mt-14">
    <Navbar/>
    <Header/>
    <Agents/>
    <Footer/>
    </div>
  );
}
