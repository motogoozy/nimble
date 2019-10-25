import React, { Component } from 'react';
import './App.scss';
import './styles.scss';
import routes from './routes';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import LandingPage from './components/views/LandingPage/LandingPage';

class App extends Component {
    state = {
        loggedIn: true,
    }
    
    render() {
        const { loggedIn } = this.state;

        return (
            <div className="App">
                {
                    loggedIn
                    &&
                    <Sidebar />
                }
                <div className='main-content-container'>
                    {
                        loggedIn
                        &&
                        <Header />
                    }
                    <div className='main-content'>
                        {
                            loggedIn
                            &&
                            <>
                                { routes }
                            </>
                        }
                        {
                            !loggedIn
                            &&
                            <LandingPage />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default App;