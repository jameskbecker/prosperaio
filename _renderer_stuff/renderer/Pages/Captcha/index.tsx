import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import Banner from '../../Components/global/Banner';
import { Button, Text } from '../../Components/UserInput';
import { Content, HeaderBar, HeaderTitle, Panel } from '../../Components/global';

interface captchaParameters {
    'sitekey': string;
    'theme'?: string;
    'size'?: string;
    'tabindex'?: string;
    'callback'?: string;
    'expired-callback'?: string;
    'error-callback'?: string;
}

declare global {
    interface Window {
        grecaptcha: {
            render: (container: string, parameters: captchaParameters) => void
            execute: (opt_widget_id?: string) => void
            reset: (opt_widget_id?: string) => void
            getResponse: (opt_widget_id?: string) => string
        }
    }
}


function createApiScript(): HTMLScriptElement {
    const apiScript = document.createElement('script');
    apiScript.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    apiScript.async = true;
    apiScript.defer = true;

    return apiScript;
}











export default () => {
    const [taskId, setTaskId] = useState('');
    const [site, setSite] = useState('www.supremenewyork.com');
    const [sitekey, setSitekey] = useState('');

    const grecaptchaOnload = (): void => {
        document.body.appendChild(createApiScript());
        document.body.appendChild(createListeners());
    
        ipcRenderer.on('captcha.request', (e, ...args: any[]) => {
            setTaskId(args[0]);
            setSitekey(args[1]);
    
            const parameters: captchaParameters = {
                sitekey: args[1], 
                callback: 'grecaptchaComplete',
                size: 'invisible',
                'expired-callback': 'grecaptchaExpired',
                'error-callback': 'grecaptchaError'
            }

            window.grecaptcha.render('captchaContainer', parameters);
        });
    
        ipcRenderer.send('captcha.ready');
    }



    function createListeners(): HTMLScriptElement {
        const paramScript = document.createElement('script');
        const callbacks: { (): void }[] = [grecaptchaComplete, grecaptchaExpired, grecaptchaError];
        paramScript.innerHTML = callbacks.join(';');
    
        return paramScript;
    }

    function grecaptchaComplete(): void {
        console.log('complete');
        ipcRenderer.send('captcha.response', taskId, "window.grecaptcha.getResponse()", Date.now());
    }

    function grecaptchaError(): void { console.log('Captcha Error.') }

    function grecaptchaExpired(): void { console.log('Captcha Expired.') }


    useEffect(grecaptchaOnload, []);

    return (
        <>
            <Banner items={[]} />
            <HeaderBar><HeaderTitle>Captcha Harvester</HeaderTitle></HeaderBar>
            <Content>
                <Panel>
                    <Text value={taskId} label="Task ID" onChange={(e) => { setTaskId(e.target.value); }} />
                    <Text value={site} label="Site" onChange={(e) => { setSite(e.target.value); }} />
                    <Button text="Login" />
                    <div id="captchaContainer" className="g-recaptcha" />
                    
                </Panel>
            </Content>

        </>
    )
}