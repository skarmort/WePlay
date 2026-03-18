import React from 'react';

import logo from 'D:/Projects/Repos/WePlay/we-play-home/we-play-home/src/weplaylogo.svg';

const Weplayhome = () => {
    return (
        <header className="App-header">
        <div className="auth-page-container">
            

            <img src={logo} className="App-logo" alt="logo" />
            <p></p>

            <p className="weplay-cartoon-1" >
                WePlay!</p>

            <p className="weplay-cartoon-1"> We Came. We Saw. We Dreamt. We Played!<br /><br />
                For the players! </p>

            <p>Created by Oscar Eko</p>
        </div>
        </header>
    );
};

export default Weplayhome;