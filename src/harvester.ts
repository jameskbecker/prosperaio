const ipcHarvester = require('electron').ipcRenderer;

interface grecaptchaProps {
  execute(): void;
  getResponse(): string;
  render(container: string, parameters: any): void;
  reset(): void;
}

declare global {
  interface Window {
    grecaptcha: grecaptchaProps;
  }
}


let config: any;
let alreadyUsed = false;

let captchaPlaceholder:HTMLElement = document.getElementById('captcha-placeholder');
let clearQueueBtn:HTMLButtonElement = <HTMLButtonElement>document.getElementById('clearQueue');
let closeBtn:HTMLButtonElement = <HTMLButtonElement>document.getElementById('close');
let taskId:HTMLInputElement = <HTMLInputElement>document.getElementById('taskId');


let captchaSpinner:HTMLElement = document.createElement('i');
captchaSpinner.className = 'fas fa-spinner fa-pulse';

clearQueueBtn.onclick = function ():void {
  ipcHarvester.send('captcha.clearQueue', config.site);
};

ipcHarvester.on('cleared queue', (event:Electron.IpcRendererEvent, args:any) => {
  console.log(args);
});

function sendToken():void {
  console.log('SENDING TOKEN');
  ipcHarvester.send('captcha.response', {
    sessionName: config.sessionName,
    site: config.site,
    id: taskId.value,
    ts: Date.now() - 5000,
    token: window.grecaptcha.getResponse(),
  });

  captchaPlaceholder.innerHTML = '';
  captchaPlaceholder.appendChild(captchaSpinner);
}

async function onloadCallback():Promise<void> {
  let data = await fetch('/config');
  config = await data.json();

  ipcHarvester.on('captcha request', (event:Electron.IpcRendererEvent, args:any) => {
    console.log('requested captcha');
    taskId.value = args.id;
    //	document.getElementById('sessionName').value = options.sessionName;
    document.getElementById('captcha-placeholder').innerHTML = '';
    if (!alreadyUsed) {
      let options = {
        sitekey: args.config.key,
        callback: 'sendToken',
        size: 'invisible',
        badge: 'inline'
        //theme: 'dark'
      };
      window.grecaptcha.render('captcha-placeholder', options);
      alreadyUsed = true;
    }
    else {
      window.grecaptcha.reset();
    }
    let clickBox = setInterval(() => {
      // let captchaFrame = document.querySelector('[role="presentation"]'),
      // 	captchaDocument = captchaFrame.contentDocument || captchaFrame.contentWindow.document,
      // 	captchaBox = captchaDocument.getElementsByClassName('recaptcha-checkbox-checkmark');
      // if (captchaBox[0]) {
      // 	clearInterval(clickBox);
      // 	captchaBox[0].click();
      // }
      window.grecaptcha.execute();
    }, 150);
  });

  captchaPlaceholder.appendChild(captchaSpinner);

  ipcHarvester.send('captcha.ready', {
    sessionName: config.sessionName,
    site: config.site
  });

  closeBtn.addEventListener('click', function ():void {
    ipcHarvester.send('captcha.closeWindow', {
      sessionName: config.sessionName,
      site: config.site
    });
  });
}

export default {};