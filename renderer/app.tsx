import React from 'react';
import ReactDom from 'react-dom';
import {HashRouter, Route} from 'react-router-dom';
import {TaskPage, ProfilePage, ProxyPage, HarvesterPage, AnalyticsPage, SettingsPage, CaptchaPage} from './pages';
import Worker from './pages/Worker';
import { Wrapper } from './components/global';

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);
document.body.setAttribute('style', 'margin:0;padding:0;');

const App = () => {
  return ( 
    <Wrapper>
      <HashRouter>
        <Route path="/index" component={TaskPage}/>
        <Route path="/profiles" component={ProfilePage}/>
        <Route path="/proxies" component={ProxyPage}/>
        <Route path="/harvesters" component={HarvesterPage}/>
        <Route path="/analytics" component={AnalyticsPage}/>
        <Route path="/settings" component={SettingsPage}/>

        <Route path="/captcha" component={CaptchaPage}/>
        <Route path="/worker" component={Worker}/>
      </HashRouter>
    </Wrapper> 
  )
}

ReactDom.render(<App/>, mainElement);