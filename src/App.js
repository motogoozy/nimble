import React from 'react';
import './App.scss';
import './styles.scss';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';

function App() {
    return (
        <div className="App">
            <Sidebar />
            <div className='main-content-container'>
                <Header />
                <div className='main-content'>

                </div>
            </div>
        </div>
    );
}

export default App;