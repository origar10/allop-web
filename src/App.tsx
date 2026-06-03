import './index.css';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';

export default function App() {
  return (
    <div>
      <Nav />
      <main>
        <Home />
      </main>
      <Footer />
    </div>
  );
}
